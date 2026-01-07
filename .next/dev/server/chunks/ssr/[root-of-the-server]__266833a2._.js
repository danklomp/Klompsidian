module.exports = [
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[project]/src/lib/notes.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"4001e58c9c8475b92ab836c3a7d1fb1671ab8ddc1c":"deleteItem","4023ba13b6317b7ae387552f335d55b395caed2679":"readNote","402df0dca6027f3ff4a9db9c7d9b1c7648745db640":"searchNotes","407d06cc5ee6d0734b075403256c654a1bf7223e39":"getNotes","6070b34c2490facdb965d6a0f05b169e3a3fcc7059":"createNote","6086b642a43e13616489bf76e9c7cbea56800a884b":"createFolder","608c855d343aafabb9c03edf00c4539ef8f6ad80f7":"moveItem","6090213f73d14b16922bf75f55acb33baccd1c272b":"saveNote"},"",""] */ __turbopack_context__.s([
    "createFolder",
    ()=>createFolder,
    "createNote",
    ()=>createNote,
    "deleteItem",
    ()=>deleteItem,
    "getNotes",
    ()=>getNotes,
    "moveItem",
    ()=>moveItem,
    "readNote",
    ()=>readNote,
    "saveNote",
    ()=>saveNote,
    "searchNotes",
    ()=>searchNotes
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
const NOTES_DIR = process.env.NOTES_PATH || '/notes';
if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(NOTES_DIR)) {
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(NOTES_DIR, {
        recursive: true
    });
}
async function getNotes(dir = NOTES_DIR) {
    const items = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(dir, {
        withFileTypes: true
    });
    const result = [];
    for (const item of items){
        const fullPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(dir, item.name);
        const relativePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].relative(NOTES_DIR, fullPath);
        if (item.isDirectory()) {
            result.push({
                name: item.name,
                title: item.name,
                path: relativePath,
                type: 'folder',
                children: await getNotes(fullPath)
            });
        } else if (item.name.endsWith('.md')) {
            const content = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(fullPath, 'utf-8');
            const h1Match = content.match(/^#\s+(.+)$/m);
            result.push({
                name: item.name.replace('.md', ''),
                title: h1Match ? h1Match[1].trim() : item.name.replace('.md', ''),
                path: relativePath,
                type: 'file'
            });
        }
    }
    return result.sort((a, b)=>{
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.title.localeCompare(b.title);
    });
}
async function readNote(filename) {
    const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(NOTES_DIR, filename);
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(filePath)) return '';
    return __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(filePath, 'utf-8');
}
async function saveNote(filename, content) {
    const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(NOTES_DIR, filename);
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(filePath, content, 'utf-8');
    return {
        success: true
    };
}
async function createNote(name, folderPath = '') {
    const filename = name.endsWith('.md') ? name : `${name}.md`;
    const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(NOTES_DIR, folderPath, filename);
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(filePath)) return {
        error: 'Bestand bestaat al'
    };
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(filePath, '# ' + name, 'utf-8');
    return {
        success: true,
        path: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(folderPath, filename)
    };
}
async function createFolder(name, parentPath = '') {
    const folderPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(NOTES_DIR, parentPath, name);
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(folderPath)) return {
        error: 'Map bestaat al'
    };
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(folderPath, {
        recursive: true
    });
    return {
        success: true
    };
}
async function deleteItem(itemPath) {
    const fullPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(NOTES_DIR, itemPath);
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(fullPath)) {
        const stats = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(fullPath);
        if (stats.isDirectory()) {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].rmSync(fullPath, {
                recursive: true,
                force: true
            });
        } else {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(fullPath);
        }
    }
    return {
        success: true
    };
}
async function moveItem(oldPath, newParentPath) {
    const sourcePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(NOTES_DIR, oldPath);
    const itemName = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].basename(oldPath);
    const destinationPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(NOTES_DIR, newParentPath, itemName);
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(sourcePath)) return {
        error: 'Bronbestand bestaat niet'
    };
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(destinationPath)) return {
        error: 'Doelbestand bestaat al'
    };
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].renameSync(sourcePath, destinationPath);
    return {
        success: true
    };
}
async function searchNotes(query) {
    const results = [];
    const searchInDir = async (dir)=>{
        const items = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(dir, {
            withFileTypes: true
        });
        for (const item of items){
            const fullPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(dir, item.name);
            const relativePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].relative(NOTES_DIR, fullPath);
            if (item.isDirectory()) {
                await searchInDir(fullPath);
            } else if (item.name.endsWith('.md')) {
                const content = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(fullPath, 'utf-8');
                const h1Match = content.match(/^#\s+(.+)$/m);
                const title = h1Match ? h1Match[1].trim() : item.name.replace('.md', '');
                if (title.toLowerCase().includes(query.toLowerCase()) || content.toLowerCase().includes(query.toLowerCase())) {
                    results.push({
                        name: item.name.replace('.md', ''),
                        title: title,
                        path: relativePath,
                        type: 'file'
                    });
                }
            }
        }
    };
    await searchInDir(NOTES_DIR);
    return results;
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getNotes,
    readNote,
    saveNote,
    createNote,
    createFolder,
    deleteItem,
    moveItem,
    searchNotes
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getNotes, "407d06cc5ee6d0734b075403256c654a1bf7223e39", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(readNote, "4023ba13b6317b7ae387552f335d55b395caed2679", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(saveNote, "6090213f73d14b16922bf75f55acb33baccd1c272b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createNote, "6070b34c2490facdb965d6a0f05b169e3a3fcc7059", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createFolder, "6086b642a43e13616489bf76e9c7cbea56800a884b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteItem, "4001e58c9c8475b92ab836c3a7d1fb1671ab8ddc1c", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(moveItem, "608c855d343aafabb9c03edf00c4539ef8f6ad80f7", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(searchNotes, "402df0dca6027f3ff4a9db9c7d9b1c7648745db640", null);
}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/lib/notes.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notes$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/notes.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/lib/notes.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "4001e58c9c8475b92ab836c3a7d1fb1671ab8ddc1c",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notes$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteItem"],
    "4023ba13b6317b7ae387552f335d55b395caed2679",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notes$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readNote"],
    "402df0dca6027f3ff4a9db9c7d9b1c7648745db640",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notes$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["searchNotes"],
    "407d06cc5ee6d0734b075403256c654a1bf7223e39",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notes$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getNotes"],
    "6070b34c2490facdb965d6a0f05b169e3a3fcc7059",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notes$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createNote"],
    "6086b642a43e13616489bf76e9c7cbea56800a884b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notes$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createFolder"],
    "608c855d343aafabb9c03edf00c4539ef8f6ad80f7",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notes$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["moveItem"],
    "6090213f73d14b16922bf75f55acb33baccd1c272b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notes$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveNote"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$lib$2f$notes$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/lib/notes.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notes$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/notes.ts [app-rsc] (ecmascript)");
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/* eslint-disable import/no-extraneous-dependencies */ Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "registerServerReference", {
    enumerable: true,
    get: function() {
        return _server.registerServerReference;
    }
});
const _server = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)"); //# sourceMappingURL=server-reference.js.map
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// This function ensures that all the exported values are valid server actions,
// during the runtime. By definition all actions are required to be async
// functions, but here we can only check that they are functions.
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ensureServerEntryExports", {
    enumerable: true,
    get: function() {
        return ensureServerEntryExports;
    }
});
function ensureServerEntryExports(actions) {
    for(let i = 0; i < actions.length; i++){
        const action = actions[i];
        if (typeof action !== 'function') {
            throw Object.defineProperty(new Error(`A "use server" file can only export async functions, found ${typeof action}.\nRead more: https://nextjs.org/docs/messages/invalid-use-server-value`), "__NEXT_ERROR_CODE", {
                value: "E352",
                enumerable: false,
                configurable: true
            });
        }
    }
} //# sourceMappingURL=action-validate.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__266833a2._.js.map