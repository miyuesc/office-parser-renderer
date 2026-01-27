import fs from 'node:fs';
import path from 'node:path';

const XSD_DIR = 'definitions/temp_xsd/xsd_files';
const OUT_DIR = 'definitions/autogen';

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

const files = fs.readdirSync(XSD_DIR).filter(f => f.endsWith('.xsd'));

// First pass: collect all groups
const groups = new Map();
for (const file of files) {
    const content = fs.readFileSync(path.join(XSD_DIR, file), 'utf-8');
    const groupRegex = /<xsd:group name="([^"]+)">([\s\S]*?)<\/xsd:group>/g;
    let match;
    while ((match = groupRegex.exec(content)) !== null) {
        groups.set(match[1], match[2]);
    }
}

for (const file of files) {
    const content = fs.readFileSync(path.join(XSD_DIR, file), 'utf-8');
    let tsContent = `/**\n * ${file}\n */\n\n`;
    
    // SimpleTypes
    const simpleTypeRegex = /<xsd:simpleType name="([^"]+)">([\s\S]*?)<\/xsd:simpleType>/g;
    let match;
    while ((match = simpleTypeRegex.exec(content)) !== null) {
        const name = match[1];
        const inner = match[2];
        const documentation = extractDoc(inner);
        const enums = Array.from(inner.matchAll(/<xsd:enumeration value="([^"]+)">([\s\S]*?)<\/xsd:enumeration>/g)).map(m => ({
            value: m[1],
            doc: extractDoc(m[2])
        }));
        
        if (documentation) tsContent += `/** ${documentation} */\n`;
        
        if (enums.length > 0) {
            tsContent += `export enum ${name} {\n`;
            for (const e of enums) {
                if (e.doc) tsContent += `    /** ${e.doc} */\n`;
                tsContent += `    ${e.value} = "${e.value}",\n`;
            }
            tsContent += `}\n\n`;
        } else {
            const restrictionMatch = inner.match(/<xsd:restriction base="([^"]+)">/);
            const base = restrictionMatch ? restrictionMatch[1] : 'xsd:string';
            tsContent += `export type ${name} = ${mapXsdType(base)};\n\n`;
        }
    }
    
    // ComplexTypes
    const complexTypeRegex = /<xsd:complexType name="([^"]+)">([\s\S]*?)<\/xsd:complexType>/g;
    while ((match = complexTypeRegex.exec(content)) !== null) {
        const name = match[1];
        let inner = match[2];
        const documentation = extractDoc(inner);
        
        const extensionMatch = inner.match(/<xsd:extension base="([^"]+)">/);
        const baseClass = extensionMatch ? extensionMatch[1].split(':').pop() : '';
        
        if (documentation) tsContent += `/** ${documentation} */\n`;
        tsContent += `export interface ${name}${baseClass ? ` extends ${baseClass}` : ''} {\n`;
        
        // Expand group refs
        let expandedInner = inner;
        let groupRefMatch;
        const groupRefRegex = /<xsd:group ref="([^"]+)"[^>]*\/>/g;
        while ((groupRefMatch = groupRefRegex.exec(inner)) !== null) {
            const groupName = groupRefMatch[1].split(':').pop();
            const groupContent = groups.get(groupName) || '';
            expandedInner = expandedInner.replace(groupRefMatch[0], groupContent);
        }

        // Detect Choice sections to make elements optional
        const choiceMatches = Array.from(expandedInner.matchAll(/<xsd:choice>([\s\S]*?)<\/xsd:choice>/g));
        const choiceContents = choiceMatches.map(m => m[1]);

        // Attributes
        const attrMatches = expandedInner.matchAll(/<xsd:attribute (name|ref)="([^"]+)"(?: type="([^"]+)")?(?: use="([^"]+)")?[^>]*>/g);
        for (const am of attrMatches) {
            const attrName = am[2].split(':').pop();
            let attrType = am[3] || 'any';
            const optional = am[4] === 'optional' || !am[4];
            tsContent += `    ${attrName}${optional ? '?' : ''}: ${mapXsdType(attrType)};\n`;
        }
        
        // Elements
        const elMatches = expandedInner.matchAll(/<xsd:element (name|ref)="([^"]+)"(?: type="([^"]+)")?(?: minOccurs="([^"]+)")?(?: maxOccurs="([^"]+)")?[^>]*>/g);
        for (const em of elMatches) {
            const elName = em[2].split(':').pop();
            let elType = em[3] || 'any';
            const minOccurs = em[4];
            const maxOccurs = em[5];
            const isArray = maxOccurs === 'unbounded' || (maxOccurs && parseInt(maxOccurs) > 1);
            
            // It's optional if minOccurs="0" OR it's inside a choice
            const isInsideChoice = choiceContents.some(c => c.includes(`"${em[2]}"`));
            const optional = minOccurs === '0' || isInsideChoice;
            
            tsContent += `    ${elName}${optional ? '?' : ''}: ${mapXsdType(elType)}${isArray ? '[]' : ''};\n`;
        }
        
        tsContent += `}\n\n`;
    }
    
    fs.writeFileSync(path.join(OUT_DIR, file.replace('.xsd', '.ts')), tsContent);
}

// --- Post-processing: Add missing imports ---
console.log('Resolving cross-file dependencies...');

const typeToFile = new Map();
const generatedFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.ts'));

// 1. Map all exported types
for (const file of generatedFiles) {
    const content = fs.readFileSync(path.join(OUT_DIR, file), 'utf-8');
    const typeRegex = /export (?:interface|type|enum) ((?:CT|ST)_[A-Za-z0-9_]+)/g;
    let match;
    while ((match = typeRegex.exec(content)) !== null) {
        typeToFile.set(match[1], file.replace('.ts', ''));
    }
}

// 2. Add missing imports to each file
for (const file of generatedFiles) {
    let content = fs.readFileSync(path.join(OUT_DIR, file), 'utf-8');
    const definedTypes = new Set();
    const typeRegex = /export (?:interface|type|enum) ((?:CT|ST)_[A-Za-z0-9_]+)/g;
    let match;
    while ((match = typeRegex.exec(content)) !== null) {
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
            if (!importsByFile.has(sourceFile)) {
                importsByFile.set(sourceFile, new Set());
            }
            importsByFile.get(sourceFile).add(type);
        }

        let importStatements = '';
        for (const [sourceFile, types] of importsByFile) {
            importStatements += `import { ${Array.from(types).sort().join(', ')} } from './${sourceFile}';\n`;
        }
        
        content = importStatements + '\n' + content;
        fs.writeFileSync(path.join(OUT_DIR, file), content);
    }
}

console.log('Conversion and post-processing completed.');
function extractDoc(str) {
    if (!str) return '';
    const docMatch = str.match(/<xsd:documentation>([\s\S]*?)<\/xsd:documentation>/);
    return docMatch ? docMatch[1].trim() : '';
}

function mapXsdType(xsdType) {
    if (!xsdType) return 'any';
    if (xsdType.startsWith('xsd:')) {
        const type = xsdType.split(':')[1];
        if (['string', 'token', 'NCName', 'ID', 'anyURI', 'base64Binary', 'hexBinary'].includes(type)) return 'string';
        if (['int', 'unsignedInt', 'unsignedByte', 'double', 'float', 'integer', 'long', 'unsignedLong', 'short', 'unsignedShort', 'decimal'].includes(type)) return 'number';
        if (type === 'boolean') return 'boolean';
        return 'any';
    }
    return xsdType.split(':').pop();
}
