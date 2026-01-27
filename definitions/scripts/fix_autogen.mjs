import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = 'definitions/autogen';

function sanitizeEnumKey(key) {
    if (!key) return '_';
    let sanitized = key;
    
    // Special cases for shared-math.ts
    if (key === '--') return 'minusMinus';
    if (key === '-+') return 'minusPlus';
    if (key === '+-') return 'plusMinus';
    
    if (/^\d/.test(sanitized)) sanitized = '_' + sanitized;
    sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '_');
    
    // Avoid double underscores
    sanitized = sanitized.replace(/_+/g, '_');
    if (sanitized.endsWith('_') && sanitized.length > 1) {
        sanitized = sanitized.slice(0, -1);
    }
    
    return sanitized;
}

function processFiles() {
    const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.ts'));
    const typeToFile = new Map();

    console.log('Building type map...');
    for (const file of files) {
        const content = fs.readFileSync(path.join(OUT_DIR, file), 'utf-8');
        const typeRegex = /export (?:interface|type|enum) ((?:CT|ST)_[A-Za-z0-9_]+)/g;
        let match;
        while ((match = typeRegex.exec(content)) !== null) {
            typeToFile.set(match[1], file.replace('.ts', ''));
        }
    }

    console.log('Fixing enums and types...');
    for (const file of files) {
        let content = fs.readFileSync(path.join(OUT_DIR, file), 'utf-8');

        // 1. Fix Enums with invalid keys
        content = content.replace(/(export enum \w+ \{)([\s\S]*?)(\})/g, (match, head, body, tail) => {
            const lines = body.split('\n');
            const newLines = lines.map(line => {
                const enumMemberMatch = line.match(/^(\s+)(.*?)(\s*=\s*")([^"]+)(".*)$/);
                if (enumMemberMatch) {
                    const [_, indent, oldKeyRaw, eq, value, rest] = enumMemberMatch;
                    const oldKey = oldKeyRaw.trim();
                    const newKey = sanitizeEnumKey(value);
                    if (newKey !== oldKey) {
                        return `${indent}${newKey}${eq}${value}${rest}`;
                    }
                }
                return line;
            });
            return head + newLines.join('\n') + tail;
        });

        // 2. Fix "extends ST_..." and "extends base64Binary"
        content = content.replace(/export interface (CT_\w+) extends (ST_\w+) \{/g, 'export interface $1 { val?: $2; ');
        content = content.replace(/export interface (CT_\w+) extends base64Binary \{/g, 'export interface $1 { val?: string; ');

        // 3. Replace 'any' with more specific types in common places
        content = content.replace(/id\??: any;/g, 'id: string;');
        content = content.replace(/embed: any;/g, 'embed: string;');
        content = content.replace(/uri?: any;/g, 'uri?: string;');
        
        // Handle ST_RotX and other known types that were 'any'
        if (file === 'dml-chart.ts') {
            content = content.replace(/export type ST_RotX = any;/g, 'export type ST_RotX = number;');
            content = content.replace(/export type ST_Overlap = any;/g, 'export type ST_Overlap = number;');
        }

        // 4. Deduplicate properties within interfaces
        content = content.replace(/(export interface \w+(?: extends \w+)? \{)([\s\S]*?)(\})/g, (match, head, body, tail) => {
            const lines = body.split('\n');
            const propMap = new Map();
            const newLines = [];
            for (const line of lines) {
                const propMatch = line.match(/^(\s+)(\w+)(\??:\s*)([^;]+)(;.*)$/);
                if (propMatch) {
                    const [_, indent, name, optional, type, rest] = propMatch;
                    if (propMap.has(name)) {
                        const existing = propMap.get(name);
                        if (existing.type.trim() !== type.trim()) {
                            // Merge types if they differ
                            existing.type = `${existing.type.trim()} | ${type.trim()}`;
                            existing.optional = '?: '; // Make optional if either was
                        }
                        // Skip adding this line, we'll update the existing one later if needed
                        continue;
                    }
                    const propObj = { indent, name, optional, type, rest };
                    propMap.set(name, propObj);
                    newLines.push(propObj);
                } else {
                    newLines.push(line);
                }
            }
            return head + newLines.map(l => typeof l === 'string' ? l : `${l.indent}${l.name}${l.optional}${l.type}${l.rest}`).join('\n') + tail;
        });

        // 5. Clean up existing imports to avoid duplicates
        content = content.replace(/^import \{ .* \} from '\.\/.*';\n/gm, '');
        content = content.trimStart();

        // 5. Build and inject imports
        const definedTypes = new Set();
        const exportRegex = /export (?:interface|type|enum) ((?:CT|ST)_[A-Za-z0-9_]+)/g;
        let match;
        while ((match = exportRegex.exec(content)) !== null) {
            definedTypes.add(match[1]);
        }

        const referencedTypes = new Set();
        const refRegex = /\b((?:CT|ST)_[A-Za-z0-9_]+)\b/g;
        while ((match = refRegex.exec(content)) !== null) {
            const typeName = match[1];
            if (!definedTypes.has(typeName) && typeToFile.has(typeName)) {
                referencedTypes.add(typeName);
            }
        }

        if (referencedTypes.size > 0) {
            const importsByFile = new Map();
            for (const type of referencedTypes) {
                const sourceFile = typeToFile.get(type);
                if (sourceFile !== file.replace('.ts', '')) {
                    if (!importsByFile.has(sourceFile)) importsByFile.set(sourceFile, new Set());
                    importsByFile.get(sourceFile).add(type);
                }
            }

            let importStatements = '';
            const sortedFiles = Array.from(importsByFile.keys()).sort();
            for (const sourceFile of sortedFiles) {
                const types = Array.from(importsByFile.get(sourceFile)).sort();
                importStatements += `import { ${types.join(', ')} } from './${sourceFile}';\n`;
            }
            content = importStatements + '\n' + content;
        }

        // 6. Final pass: define missing types as any
        const stillMissing = new Set();
        const finalRefRegex = /\b((?:CT|ST)_[A-Za-z0-9_]+)\b/g;
        while ((match = finalRefRegex.exec(content)) !== null) {
            const typeName = match[1];
            if (!definedTypes.has(typeName) && !typeToFile.has(typeName)) {
                stillMissing.add(typeName);
            }
        }

        if (stillMissing.size > 0) {
            content += '\n// Fallback definitions for missing types\n';
            for (const type of Array.from(stillMissing).sort()) {
                content += `export type ${type} = any;\n`;
            }
        }

        fs.writeFileSync(path.join(OUT_DIR, file), content);
    }

    console.log('Fix completed.');
}

processFiles();
