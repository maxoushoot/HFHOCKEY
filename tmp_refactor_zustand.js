const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === '.git' || file === '.expo') return;
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const dirs = [
    'c:/Users/Utilisateur/OneDrive/Bureau/hockey/app',
    'c:/Users/Utilisateur/OneDrive/Bureau/hockey/components'
];

let files = [];
dirs.forEach(d => { if (fs.existsSync(d)) files = files.concat(walk(d)); });

const useStoreRegex = /const\s+\{\s*([^}]+?)\s*\}\s*=\s*useStore\(\s*\)\s*;/g;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;

    // Fast check
    if (!content.includes('useStore()')) return;

    content = content.replace(useStoreRegex, (match, inner) => {
        hasChanges = true;
        const keys = inner.split(',').map(k => k.trim()).filter(k => k);
        const mapContent = keys.map(k => `  ${k}: state.${k}`).join(',\n');
        return `const { ${keys.join(', ')} } = useStore(useShallow(state => ({\n${mapContent}\n})));`;
    });

    if (hasChanges) {
        // Add import { useShallow } from 'zustand/react/shallow';
        if (!content.includes("import { useShallow } from 'zustand/react/shallow'")) {
            // Find last import
            const lines = content.split('\n');
            const lastImportIndex = lines.map(l => l.trim().startsWith('import ')).lastIndexOf(true);
            if (lastImportIndex !== -1) {
                lines.splice(lastImportIndex + 1, 0, "import { useShallow } from 'zustand/react/shallow';");
            } else {
                lines.unshift("import { useShallow } from 'zustand/react/shallow';");
            }
            content = lines.join('\n');
        }
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated useStore in: ' + file);
    }
});
