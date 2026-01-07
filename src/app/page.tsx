'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Plus, Save, Sidebar as SidebarIcon, Trash2, Folder, FolderPlus, ChevronRight, ChevronDown, Eye, Edit3, Search, X, LogOut } from 'lucide-react';
import { getNotes, readNote, saveNote, createNote, deleteItem, createFolder, moveItem, searchNotes, NoteItem } from '@/lib/notes';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [activeNote, setActiveNote] = useState<string | null>(null);
    const [content, setContent] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
    const [draggingPath, setDraggingPath] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<NoteItem[] | null>(null);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    };

    useEffect(() => {
        refreshNotes();
    }, []);

    useEffect(() => {
        if (!activeNote || viewMode !== 'edit') return;

        const timer = setTimeout(async () => {
            setIsSaving(true);
            try {
                await saveNote(activeNote, content);
                // We don't necessarily need to refresh notes list on every keystroke save,
                // but we might want to if titles are based on content (H1)
                const list = await getNotes();
                setNotes(list);
            } catch (error) {
                console.error('Failed to autosave:', error);
            } finally {
                setIsSaving(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [content, activeNote, viewMode]);

    useEffect(() => {
        const handleSearch = async () => {
            if (searchQuery.trim().length > 1) {
                const results = await searchNotes(searchQuery);
                setSearchResults(results);
            } else {
                setSearchResults(null);
            }
        };

        const timer = setTimeout(handleSearch, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const refreshNotes = async () => {
        const list = await getNotes();
        setNotes(list);
    };

    const handleSelectNote = async (itemPath: string) => {
        const text = await readNote(itemPath);
        setActiveNote(itemPath);
        setContent(text);
        // Start always in edit mode when selecting a new note
        setViewMode('edit');
    };

    const handleDelete = async (e: React.MouseEvent, itemPath: string, name: string) => {
        e.stopPropagation();
        if (confirm(`Weet je zeker dat je '${name}' wilt verwijderen?`)) {
            await deleteItem(itemPath);
            if (activeNote === itemPath || activeNote?.startsWith(itemPath + '/')) {
                setActiveNote(null);
                setContent('');
            }
            await refreshNotes();
        }
    };

    const handleSave = async () => {
        if (activeNote) {
            await saveNote(activeNote, content);
            await refreshNotes();
        }
    };

    const handleNewNote = async (folderPath = '') => {
        const name = prompt('Naam voor nieuwe notitie:', 'Nieuwe Notitie');
        if (!name) return;
        const res = await createNote(name, folderPath);
        if ('success' in res && res.path) {
            await refreshNotes();
            handleSelectNote(res.path);
        }
    };

    const handleNewFolder = async (parentPath = '') => {
        const name = prompt('Naam voor nieuwe map:', 'Nieuwe Map');
        if (!name) return;
        const res = await createFolder(name, parentPath);
        if ('success' in res) {
            setExpandedFolders(prev => ({ ...prev, [parentPath]: true }));
            await refreshNotes();
        }
    };

    const toggleFolder = (folderPath: string) => {
        setExpandedFolders(prev => ({ ...prev, [folderPath]: !prev[folderPath] }));
    };

    // Drag and Drop handlers
    const onDragStart = (e: React.DragEvent, path: string) => {
        setDraggingPath(path);
        e.dataTransfer.setData('text/plain', path);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e: React.DragEvent, path: string, type: string) => {
        e.stopPropagation();
        if (type === 'folder' && draggingPath !== path && !path.startsWith(draggingPath + '/')) {
            e.preventDefault();
            setDropTarget(path);
        } else if (path === '' && draggingPath) { // Root drop
            e.preventDefault();
            setDropTarget('');
        }
    };

    const onDrop = async (e: React.DragEvent, targetPath: string) => {
        e.preventDefault();
        e.stopPropagation();
        const sourcePath = e.dataTransfer.getData('text/plain');
        setDropTarget(null);
        setDraggingPath(null);

        if (sourcePath && sourcePath !== targetPath && !targetPath.startsWith(sourcePath + '/')) {
            const res = await moveItem(sourcePath, targetPath);
            if ('success' in res) {
                if (activeNote === sourcePath) {
                    const fileName = sourcePath.split('/').pop();
                    setActiveNote(targetPath === '' ? fileName! : `${targetPath}/${fileName}`);
                }
                await refreshNotes();
            } else if ('error' in res) {
                alert(res.error);
            }
        }
    };

    const renderTree = (items: NoteItem[], depth = 0) => {
        return items.map((item) => (
            <div key={item.path}>
                <div
                    className={`note-item ${activeNote === item.path ? 'active' : ''} ${dropTarget === item.path ? 'drop-target' : ''} ${draggingPath === item.path ? 'dragging' : ''}`}
                    style={{ paddingLeft: `${depth * 15 + 20}px` }}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.path)}
                    onDragOver={(e) => onDragOver(e, item.path, item.type)}
                    onDragLeave={() => setDropTarget(null)}
                    onDrop={(e) => onDrop(e, item.path)}
                    onClick={() => item.type === 'folder' ? toggleFolder(item.path) : handleSelectNote(item.path)}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                        {item.type === 'folder' ? (
                            <>
                                {expandedFolders[item.path] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                <Folder size={16} color="#bb86fc" />
                            </>
                        ) : (
                            <FileText size={16} />
                        )}
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.title}
                        </span>
                    </div>
                    <div className="item-actions">
                        {item.type === 'folder' && (
                            <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleNewNote(item.path); }}>
                                <Plus size={14} />
                            </button>
                        )}
                        <button
                            className="delete-btn"
                            onClick={(e) => handleDelete(e, item.path, item.title)}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
                {item.type === 'folder' && expandedFolders[item.path] && item.children && (
                    <div>{renderTree(item.children, depth + 1)}</div>
                )}
            </div>
        ));
    };

    return (
        <div className="app-container">
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 260 : 0 }}
                className="sidebar"
                onDragOver={(e) => onDragOver(e, '', 'folder')}
                onDrop={(e) => onDrop(e, '')}
            >
                <div className="sidebar-header">
                    <span>Klompsidian</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => handleNewFolder()} className="new-note-btn" title="Nieuwe Map" style={{ padding: '6px' }}>
                            <FolderPlus size={18} />
                        </button>
                        <button onClick={() => handleNewNote()} className="new-note-btn" title="Nieuwe Notitie" style={{ padding: '6px' }}>
                            <Plus size={18} />
                        </button>
                        <button onClick={handleLogout} className="new-note-btn" title="Uitloggen" style={{ padding: '6px', background: 'rgba(255, 68, 68, 0.2)', color: '#ff6b6b' }}>
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                <div style={{ padding: '10px 15px' }}>
                    <div className="search-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', color: '#666' }} />
                        <input
                            type="text"
                            placeholder="Doorzoek notities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                padding: '6px 30px',
                                fontSize: '0.85rem',
                                color: 'var(--foreground)',
                                outline: 'none'
                            }}
                        />
                        {searchQuery && (
                            <X
                                size={14}
                                style={{ position: 'absolute', right: '10px', color: '#666', cursor: 'pointer' }}
                                onClick={() => setSearchQuery('')}
                            />
                        )}
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
                    {searchResults ? (
                        <div className="search-results">
                            <div style={{ padding: '5px 15px', fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {searchResults.length} resultaten gevonden
                            </div>
                            {renderTree(searchResults)}
                        </div>
                    ) : (
                        renderTree(notes)
                    )}
                </div>
            </motion.aside>

            <main className="main-content">
                <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', color: 'var(--foreground)', cursor: 'pointer' }}>
                        <SidebarIcon size={20} />
                    </button>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {activeNote && (
                            <>
                                <span style={{ fontSize: '0.8rem', color: '#666', fontFamily: 'monospace' }}>{activeNote}</span>
                                <div className="mode-toggle">
                                    <button
                                        className={`toggle-btn ${viewMode === 'edit' ? 'active' : ''}`}
                                        onClick={() => setViewMode('edit')}
                                        title="Bewerk Modus"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        className={`toggle-btn ${viewMode === 'preview' ? 'active' : ''}`}
                                        onClick={() => setViewMode('preview')}
                                        title="Lees Modus"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleSave}
                                    className={`new-note-btn ${isSaving ? 'saving' : ''}`}
                                    style={{ padding: '6px 12px', minWidth: '40px', display: 'flex', justifyContent: 'center' }}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Save size={16} />
                                        </motion.div>
                                    ) : (
                                        <Save size={16} />
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {activeNote ? (
                    <div className="editor-view-container">
                        {viewMode === 'edit' ? (
                            <div className="glass-panel editor-only">
                                <textarea
                                    className="markdown-input"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Typ hier je markdown..."
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <div className="glass-panel preview-only">
                                <div className="preview-content">
                                    <ReactMarkdown>{content}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', flexDirection: 'column' }}>
                        <Folder size={48} style={{ marginBottom: '20px', opacity: 0.2 }} />
                        Selecteer een notitie of maak een nieuwe aan
                    </div>
                )}
            </main>
        </div>
    );
}
