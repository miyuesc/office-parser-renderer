import { DocxParser, DocxRenderer } from '@ai-space/docx';
import { PptxParser, PptxRenderer } from '@ai-space/pptx';
import { XlsxParser, XlsxRenderer } from '@ai-space/xlsx';

const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const container = document.getElementById('container') as HTMLElement;
const status = document.getElementById('status') as HTMLSpanElement;

fileInput.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const name = file.name.toLowerCase();

    status.textContent = 'Parsing...';
    try {
        if (name.endsWith('.docx')) {
            const parser = new DocxParser();
            const doc = await parser.parse(arrayBuffer);
            console.log('DOCX AST:', doc);
            
            const renderer = new DocxRenderer(container);
            await renderer.render(doc);
            
        } else if (name.endsWith('.pptx')) {
            const parser = new PptxParser();
            const doc = await parser.parse(arrayBuffer);
            console.log('PPTX AST:', doc);

            const renderer = new PptxRenderer(container);
            await renderer.render(doc);

        } else if (name.endsWith('.xlsx')) {
            const parser = new XlsxParser();
            const doc = await parser.parse(arrayBuffer);
            console.log('XLSX AST:', doc);

            const renderer = new XlsxRenderer(container);
            await renderer.render(doc);

            // Sheet Switcher
            if (doc.sheets && doc.sheets.length > 1) {
                const controls = document.createElement('div');
                controls.style.marginBottom = '10px';
                
                doc.sheets.forEach((sheet, index) => {
                    const btn = document.createElement('button');
                    btn.textContent = sheet.name || `Sheet ${index + 1}`;
                    btn.style.marginRight = '5px';
                    btn.onclick = () => {
                         renderer.render(doc, index);
                    };
                    controls.appendChild(btn);
                });
                
                container.parentElement?.insertBefore(controls, container);
            }
        }
        status.textContent = 'Rendered!';
    } catch (err: any) {
        console.error(err);
        status.textContent = 'Error: ' + err.message;
    }
});
// Auto-load test.xlsx
(async () => {
    try {
        const res = await fetch('/test.xlsx');
        if (res.ok) {
            const buf = await res.arrayBuffer();
            const parser = new XlsxParser();
            const doc = await parser.parse(buf);
            console.log('XLSX AST (Auto):', doc);
            const renderer = new XlsxRenderer(container);
            await renderer.render(doc);
            
            // Re-render tabs?
            // Existing `renderer.render` handles basic tabs internally now?
            // The renderer I looked at HAS tab rendering in `renderLayout`.
            // So I don't need external controls in main.ts necessarily, 
            // but let's leave existing listener alone.
        }
    } catch (e) {
        console.error('Auto-load failed', e);
    }
})();
