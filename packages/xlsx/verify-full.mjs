
import { XlsxParser, XlsxRenderer } from './dist/index.mjs';
import { readFile } from 'fs/promises';
import { parseHTML } from 'linkedom';
import { join } from 'path';

// Polyfill DOM
const { window, document, HTMLElement, Node, Text, Blob, URL, DOMParser } = parseHTML('<!doctype html><html><body></body></html>');
global.window = window;
global.document = document;
global.HTMLElement = HTMLElement;
global.Node = Node;
global.Text = Text;
global.DOMParser = DOMParser || window.DOMParser;
global.Blob = class MockBlob {
    constructor(content, options) { this.content = content; this.type = options?.type; }
};
global.URL = { createObjectURL: () => 'blob:mock-url' };

async function run() {
    try {
        const filePath = join(process.cwd(), '../../spec/files/xlsx-zip.zip'); 
        // Wait, user provided "测试xlsx 解析.xlsx". I should use that if possible, or the unzipped folder?
        // ZipService loads generic buffer.
        // Let's try loading the XLSX file directly.
        
        // Finding the file
        // The user said: "You have validation file at spec/files/..."
        // Let's assume absolute path for safety in this env or relative.
        // I'll search for it first or assume relative.
        // Previous path used: spec/files/测试xlsx 解析.xlsx
        
        const possiblePath = '../../spec/files/xlsx-files/测试xlsx 解析.xlsx';
        const buffer = await readFile(possiblePath);
        
        console.log(`Loaded file: ${possiblePath}, size: ${buffer.byteLength}`);

        const parser = new XlsxParser();
        const workbook = await parser.parse(buffer);
        
        console.log('Workbook parsed.');
        console.log(`Sheets: ${workbook.sheets.length}`);
        workbook.sheets.forEach((s, i) => {
            console.log(`Sheet ${i+1}: ${s.name} (State: ${s.state || 'visible'})`);
            console.log(`  - Rows: ${Object.keys(s.rows).length}`);
            if (s.images?.length > 0) {
                 console.log('IMAGES:', s.images.map(img => ({
                     name: img.name,
                     embedId: img.embedId,
                     dataSize: img.data ? img.data.byteLength : 0,
                     mime: img.mimeType,
                     srcStart: img.src ? img.src.substring(0, 30) : 'null'
                 })));
            }
            
            if (s.shapes?.length) {
                console.log('SHAPES:', JSON.stringify(s.shapes, null, 2));
            }
        });

        // Test Rendering
        const container = document.createElement('div');
        container.style.width = '1000px';
        container.style.height = '1000px';
        const renderer = new XlsxRenderer(container);
        await renderer.render(workbook);
        
        console.log('Rendered successfully.');
        
        // Assertions
        const svg = container.querySelector('svg');
        const lines = container.querySelectorAll('line'); 
        const groups = container.querySelectorAll('g'); // Shapes
        const foreignObjects = container.querySelectorAll('foreignObject'); // Text
        const svgImages = container.querySelectorAll('image'); // Images inside SVG
        
        console.log(`Rendered SVG: ${!!svg}`);
        console.log(`Rendered Lines (Connectors): ${lines.length}`);
        console.log(`Rendered Shape Groups: ${groups.length}`);
        console.log(`Rendered Text Blocks (ForeignObject): ${foreignObjects.length}`);
        console.log(`Rendered SVG Images: ${svgImages.length}`);
        
        if (!svg) throw new Error('No SVG overlay found');
        if (workbook.sheets[0].shapes?.length && groups.length === 0) throw new Error('Shapes missing in SVG');
        if (workbook.sheets[0].connectors?.length && lines.length === 0) throw new Error('Connectors missing in SVG');
        
    } catch (e) {
        console.error('Verification failed:', e);
        process.exit(1);
    }
}

run();
