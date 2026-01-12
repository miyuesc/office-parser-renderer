import { PptxDocument } from '../types.ts';

export class PptxRenderer {
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    async render(doc: PptxDocument, slideIndex: number = 0) {
        const slide = doc.slides[slideIndex];
        if (!slide) return;
        
        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.width = '960px'; // Default PPTX width approx
        this.container.style.height = '540px'; // Default PPTX height approx
        this.container.style.overflow = 'hidden';
        this.container.style.border = '1px solid #ccc';
        
        if (doc.theme && doc.theme.backgroundColor) {
             this.container.style.backgroundColor = doc.theme.backgroundColor;
        } else {
             this.container.style.backgroundColor = 'white';
        }

        for (const elem of slide.elements) {
            if (elem.type === 'shape') {
                this.renderShape(elem);
            } else if (elem.type === 'textbox') {
                 this.renderShape(elem as any); 
            } else if (elem.type === 'picture') {
                this.renderImage(elem);
            }
        }
    }

    private renderShape(elem: import('../types').Shape) {
        const { x, y, w, h, fill, outline } = elem.props;
        
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        div.style.width = `${w}px`;
        div.style.height = `${h}px`;
        div.style.boxSizing = 'border-box'; // Ensure border is included in size
        
        if (elem.geometry === 'ellipse') { 
            div.style.borderRadius = '50%';
        }
        
        if (fill) {
            div.style.backgroundColor = fill;
        }
        
        if (outline) {
            div.style.border = `1px solid ${outline}`;
        }
        
        // Debug fallback
        if (!fill && !outline) {
            div.style.border = '1px solid #cccccc';
        }

        // Handle Text content for Textbox/Shape
        if ((elem as any).text) {
             div.textContent = (elem as any).text;
             div.style.display = 'flex';
             div.style.alignItems = 'center'; // Center vert
             div.style.justifyContent = 'center'; // Center horiz
             div.style.fontFamily = 'Arial, sans-serif';
             div.style.fontSize = '14px'; // Default
             div.style.color = 'black'; // Default
        }

        this.container.appendChild(div);
    }

    private renderImage(elem: import('../types').Picture) {
        const { src, x, y, w, h } = elem.image;
        if (!src) return;

        const img = document.createElement('img');
        img.src = src;
        img.style.position = 'absolute';
        img.style.left = `${x}px`;
        img.style.top = `${y}px`;
        img.style.width = `${w}px`;
        img.style.height = `${h}px`;
        
        this.container.appendChild(img);
    }
}
