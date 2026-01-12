import { DocxDocument, Paragraph, Run } from '../types.ts';
import { ListCounter } from './ListCounter';

export class DocxRenderer {
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    async render(doc: DocxDocument) {
        this.container.innerHTML = ''; // Clear container
        this.container.style.position = 'relative'; 
        this.container.style.padding = '50px'; // Basic page margin
        this.container.style.backgroundColor = 'white';

        const listCounter = new ListCounter(doc.numbering);

        for (const elem of doc.body) {
            if (elem.type === 'paragraph') {
                const p = this.createParagraph(elem, listCounter, doc);
                this.container.appendChild(p);
            } else if (elem.type === 'table') {
                const tbl = this.createTable(elem, listCounter, doc);
                this.container.appendChild(tbl);
            }
        }
    }

    private createParagraph(elem: Paragraph, listCounter: ListCounter, doc: DocxDocument): HTMLElement {
        const p = document.createElement('div');
        p.style.marginBottom = '10pt'; // Paragraph spacing
        p.style.lineHeight = '1.2';

        // 1. Render Numbering
        if (elem.props.numbering) {
            const { id, level } = elem.props.numbering;
            const markerText = listCounter.getNextNumber(id.toString(), level);
            
            const marker = document.createElement('span');
            marker.textContent = markerText + ' ';
            marker.style.marginRight = '10px';
            p.appendChild(marker);
            
            p.style.display = 'flex'; // To handle marker alignment roughly
        }

        // 2. Render Children
        for (const child of elem.children) {
             if (child.type === 'run') {
                 p.appendChild(this.createRun(child));
             } else if (child.type === 'drawing' && child.image) {
                 p.appendChild(this.createImage(child, doc));
             }
        }
        return p;
    }

    private createRun(run: Run): HTMLElement {
        const span = document.createElement('span');
        span.textContent = run.text;
        
        let font = '12pt sans-serif';
        if (run.props.bold) span.style.fontWeight = 'bold';
        if (run.props.italic) span.style.fontStyle = 'italic';
        if (run.props.color) span.style.color = `#${run.props.color}`;
        
        span.style.font = font; // Reset if needed or construct full font string
        // Separate styles for clarity
        span.style.fontSize = '12pt';
        span.style.fontFamily = 'sans-serif';
        
        return span;
    }

    private createImage(drawing: import('../types').Drawing, doc: DocxDocument): HTMLElement {
        // Need to find the blob URL from doc.images using drawing.image.src (rId)
        // Note: The parser in previous step (Pptx) had image parsing logic. 
        // DocxParser also has images mapping.
        
        // However, DocxParser stores images in `doc.images` keyed by path/rId?
        // Checking DocxParser.ts again... it keyed by target path.
        // And drawing.image.src is the rId. The parser resolved rId to path?
        // Actually DocxParser `parseDrawing` uses `embedId` as `src`. 
        // We need to resolve embedId to target path using `doc.relationships`.
        
        const rId = drawing.image.src;
        // The parser didn't fully expose resolving logic in render phase easily
        // But wait, DocxParser.ts returns `relationships` map.
        const target = doc.relationships?.[rId]; 
        let src = '';
        
        if (target) {
            // Clean target if needed, DocxParser images map keys might be specific
            // DocxParser loaded images with `cleanTarget`. 
            const cleanTarget = target.startsWith('/') ? target.substring(1) : `word/${target}`;
             src = doc.images?.[cleanTarget] || '';
        }

        const img = document.createElement('img');
        if (src) img.src = src;
        
        img.style.width = `${drawing.image.width}px`;
        img.style.height = `${drawing.image.height}px`;
        img.style.display = 'inline-block';
        img.style.verticalAlign = 'bottom'; 
        
        return img;
    }

    private createTable(table: import('../types').Table, listCounter: ListCounter, doc: DocxDocument): HTMLElement {
        const tbl = document.createElement('table');
        tbl.style.borderCollapse = 'collapse';
        tbl.style.width = '100%'; // Or calculate from grid
        
        for (const row of table.rows) {
            const tr = document.createElement('tr');
            
            row.cells.forEach(cell => {
                const td = document.createElement('td');
                td.style.border = '1px solid black'; // Default border
                td.style.padding = '5px';
                
                // Width
                if (cell.props.width) {
                    td.style.width = `${cell.props.width}px`;
                }
                
                // Content
                for (const child of cell.children) {
                    if (child.type === 'paragraph') {
                        td.appendChild(this.createParagraph(child, listCounter, doc));
                    }
                }
                tr.appendChild(td);
            });
            tbl.appendChild(tr);
        }
        return tbl;
    }
}
