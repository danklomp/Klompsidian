'use server'

import fs from 'fs';
import path from 'path';

const NOTES_DIR = process.env.NOTES_PATH || '/notes';

if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR, { recursive: true });
}

export type NoteItem = {
    name: string;
    title: string;
    path: string;
    type: 'file' | 'folder';
    children?: NoteItem[];
};

export async function getNotes(dir = NOTES_DIR): Promise<NoteItem[]> {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    const result: NoteItem[] = [];

    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relativePath = path.relative(NOTES_DIR, fullPath);

        if (item.isDirectory()) {
            result.push({
                name: item.name,
                title: item.name,
                path: relativePath,
                type: 'folder',
                children: await getNotes(fullPath),
            });
        } else if (item.name.endsWith('.md')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const h1Match = content.match(/^#\s+(.+)$/m);
            result.push({
                name: item.name.replace('.md', ''),
                title: h1Match ? h1Match[1].trim() : item.name.replace('.md', ''),
                path: relativePath,
                type: 'file',
            });
        }
    }

    return result.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.title.localeCompare(b.title);
    });
}

export async function readNote(filename: string) {
    const filePath = path.join(NOTES_DIR, filename);
    if (!fs.existsSync(filePath)) return '';
    return fs.readFileSync(filePath, 'utf-8');
}

export async function saveNote(filename: string, content: string) {
    const filePath = path.join(NOTES_DIR, filename);
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true };
}

export async function createNote(name: string, folderPath = '') {
    const filename = name.endsWith('.md') ? name : `${name}.md`;
    const filePath = path.join(NOTES_DIR, folderPath, filename);
    if (fs.existsSync(filePath)) return { error: 'Bestand bestaat al' };
    fs.writeFileSync(filePath, '# ' + name, 'utf-8');
    return { success: true, path: path.join(folderPath, filename) };
}

export async function createFolder(name: string, parentPath = '') {
    const folderPath = path.join(NOTES_DIR, parentPath, name);
    if (fs.existsSync(folderPath)) return { error: 'Map bestaat al' };
    fs.mkdirSync(folderPath, { recursive: true });
    return { success: true };
}

export async function deleteItem(itemPath: string) {
    const fullPath = path.join(NOTES_DIR, itemPath);
    if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
            fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
            fs.unlinkSync(fullPath);
        }
    }
    return { success: true };
}

export async function moveItem(oldPath: string, newParentPath: string) {
    const sourcePath = path.join(NOTES_DIR, oldPath);
    const itemName = path.basename(oldPath);
    const destinationPath = path.join(NOTES_DIR, newParentPath, itemName);

    if (!fs.existsSync(sourcePath)) return { error: 'Bronbestand bestaat niet' };
    if (fs.existsSync(destinationPath)) return { error: 'Doelbestand bestaat al' };

    fs.renameSync(sourcePath, destinationPath);
    return { success: true };
}

export async function searchNotes(query: string): Promise<NoteItem[]> {
    const results: NoteItem[] = [];
    const searchInDir = async (dir: string) => {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            const relativePath = path.relative(NOTES_DIR, fullPath);

            if (item.isDirectory()) {
                await searchInDir(fullPath);
            } else if (item.name.endsWith('.md')) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const h1Match = content.match(/^#\s+(.+)$/m);
                const title = h1Match ? h1Match[1].trim() : item.name.replace('.md', '');

                if (
                    title.toLowerCase().includes(query.toLowerCase()) ||
                    content.toLowerCase().includes(query.toLowerCase())
                ) {
                    results.push({
                        name: item.name.replace('.md', ''),
                        title: title,
                        path: relativePath,
                        type: 'file',
                    });
                }
            }
        }
    };

    await searchInDir(NOTES_DIR);
    return results;
}
