import { XlsxWorkbook, XlsxSheet, XlsxRow, XlsxCell, OfficeImage, OfficeShape, OfficeConnector, OfficeGroupShape } from '../types';
import { CellStyleUtils } from './CellStyleUtils';
import { NumberFormatUtils } from '../utils/NumberFormatUtils';

export class XlsxRenderer {
    private container: HTMLElement;
    private currentSheetIndex: number = 0;
    private workbook: XlsxWorkbook | null = null;
    
    // State for Scrolling and Layout
    private contentContainer: HTMLElement | null = null;
    private rowHeights: number[] = [];
    private colWidths: number[] = [];

    constructor(container: HTMLElement) {
        this.container = container;
    }

    async render(workbook: XlsxWorkbook) {
        this.workbook = workbook;
        this.currentSheetIndex = 0;
        this.renderLayout();
    }
    
    public scrollTo(row: number, col: number) {
        if (!this.contentContainer) return;
        
        let top = 0;
        for (let r = 0; r < row; r++) top += (this.rowHeights[r] || 20);
        
        let left = 0;
        for (let c = 1; c < col; c++) left += (this.colWidths[c] || 64);
        
        this.contentContainer.scrollTo({ top, left, behavior: 'smooth' });
    }

    private renderLayout() {
        if (!this.workbook) return;

        this.container.innerHTML = '';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.height = '100%';
        this.container.style.backgroundColor = '#f3f2f1'; // Excel-like gray bg

        // 1. Sheet Content Area
        const contentArea = document.createElement('div');
        contentArea.style.flex = '1';
        contentArea.style.overflow = 'auto';
        contentArea.style.position = 'relative';
        contentArea.style.backgroundColor = '#ffffff';
        this.container.appendChild(contentArea);
        this.contentContainer = contentArea;

        // 2. Tabs Bar
        const tabsBar = document.createElement('div');
        tabsBar.style.height = '32px';
        tabsBar.style.backgroundColor = '#f3f2f1';
        tabsBar.style.display = 'flex';
        tabsBar.style.alignItems = 'flex-end';
        tabsBar.style.paddingLeft = '10px';
        tabsBar.style.borderTop = '1px solid #c8c8c8';
        this.container.appendChild(tabsBar);

        // Render Tabs
        this.workbook.sheets.forEach((sheet, index) => {
            if (sheet.state === 'hidden' || sheet.state === 'veryHidden') return;

            const tab = document.createElement('div');
            tab.textContent = sheet.name;
            tab.style.padding = '5px 15px';
            tab.style.marginRight = '2px';
            tab.style.cursor = 'pointer';
            tab.style.fontSize = '12px';
            tab.style.userSelect = 'none';
            
            if (index === this.currentSheetIndex) {
                tab.style.backgroundColor = '#ffffff';
                tab.style.borderBottom = '1px solid #ffffff'; // Hide bottom border to blend
                tab.style.color = '#107c41'; // Excel Green for active
                tab.style.fontWeight = 'bold';
            } else {
                tab.style.backgroundColor = 'transparent';
                tab.style.color = '#444';
            }
            
            tab.onclick = () => {
                this.currentSheetIndex = index;
                this.renderLayout(); // Re-render everything (simple but robust)
            };
            
            tabsBar.appendChild(tab);
        });

        // Render Active Sheet
        this.renderSheet(contentArea);
    }

    private renderSheet(container: HTMLElement) {
        if (!this.workbook) return;
        const sheet = this.workbook.sheets[this.currentSheetIndex];
        if (!sheet) return;

        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse';
        table.style.tableLayout = 'fixed'; 
        // table.style.minWidth = '100%'; // Remove constraint to allow scroll
        table.style.width = 'max-content'; // Allow it to expand
        
        // Debug
        // console.log('Rendering Sheet:', sheet.name);
        // console.log('Sheet Images:', sheet.images?.length);
        // console.log('Sheet Shapes:', sheet.shapes?.length);
        // console.log('Sheet Connectors:', sheet.connectors?.length);

        // Columns
        // We need to calculate columns based on row data if cols are not fully defined
        
        // Find max col index from data
        let maxCol = 0;
        Object.values(sheet.rows).forEach(r => {
            const indices = Object.keys(r.cells).map(Number);
            if (indices.length > 0) {
                maxCol = Math.max(maxCol, Math.max(...indices));
            }
        });
        
        const getColDef = (idx: number) => {
            return sheet.cols.find((c: any) => idx >= c.min && idx <= c.max);
        }

        // Create colgroup
        const colgroup = document.createElement('colgroup');
        let totalWidth = 0;

        for (let c = 1; c <= maxCol; c++) {
            const col = document.createElement('col');
            const colDef = getColDef(c);
            // Approx default width ~64px (8 chars)
            let width = 64;
            if (colDef) {
                 // Width in Excel is "number of characters of max digit width" approx.
                 // Factor roughly 7px per unit? simplified.
                 width = colDef.width * 7.5; 
            }
            totalWidth += width;
            col.style.width = `${width}px`;
            colgroup.appendChild(col);
        }
        table.appendChild(colgroup);
        
        // Set table width to trigger scroll
        table.style.width = `${totalWidth}px`;
        // table.style.minWidth = '100%'; // Ensure it fills at least 100% of container if small content

        // Rows
        const rowIndices = Object.keys(sheet.rows).map(Number).sort((a, b) => a - b);
        
        rowIndices.forEach(rIdx => {
             const rowInfo = sheet.rows[rIdx];
             const tr = document.createElement('tr');
             
             if (rowInfo.height) {
                 tr.style.height = `${rowInfo.height * 1.33}px`; // Points to Pixels approx
             } else {
                 tr.style.height = '20px'; // Default
             }

             if (rowInfo.hidden) {
                 tr.style.display = 'none';
             }

             // We need full grid? Table automatically handles sparse cells if we insert TDs correctly.
             // But if we want exact column alignment, we might need to fill gaps.
             
             const cells = rowInfo.cells;
             // Let's iterate 1 to maxCol to be safe if tableLayout is fixed
             for (let c = 1; c <= maxCol; c++) {
                 // Check if cell is covered by a merge
                 if (this.isMerged(rIdx, c, sheet.merges)) continue;

                 const cell = cells[c];
                 const td = document.createElement('td');
                 
                 // Handle Merges Start
                 const merge = this.getMergeStart(rIdx, c, sheet.merges);
                 if (merge) {
                     td.colSpan = merge.e.c - merge.s.c + 1;
                     td.rowSpan = merge.e.r - merge.s.r + 1;
                 }
                 
                 if (cell) {
                     // Value & Format
                    let rawValue: any = cell.value;
                    let isNumber = false;

                    if (this.workbook && cell.type === 's') {
                        const idx = typeof cell.value === 'number' ? cell.value : parseInt(cell.value as string);
                        rawValue = this.workbook.sharedStrings[idx] || '';
                    } else if (cell.type === 'b') {
                        rawValue = cell.value ? 'TRUE' : 'FALSE';
                    } else if (cell.type === 'n' || (!cell.type && rawValue !== undefined)) {
                        // Numeric
                        const num = Number(cell.value);
                        if (!isNaN(num)) {
                            rawValue = num;
                            isNumber = true;
                        } else {
                            rawValue = ''; // or undefined
                        }
                    }

                    let displayText = String(rawValue !== undefined && rawValue !== null ? rawValue : '');
                    
                    if (isNumber && this.workbook && cell.styleIndex !== undefined) {
                         const xf = this.workbook.styles.cellXfs[cell.styleIndex];
                         if (xf) {
                             const fmtCode = this.workbook.styles.numFmts[xf.numFmtId];
                             if (fmtCode) {
                                 displayText = NumberFormatUtils.format(rawValue, fmtCode, this.workbook.date1904);
                             }
                         }
                    }
                    td.textContent = displayText;
                     
                     // Style
                     if (this.workbook && cell.styleIndex !== undefined) {
                         const css = CellStyleUtils.getCss(this.workbook, cell.styleIndex);
                         Object.assign(td.style, css);
                     }
                 }
                 
                 // Default Grid Border if no specific border
                 const hasBorder = td.style.borderTop || td.style.borderRight || td.style.borderBottom || td.style.borderLeft || td.style.border;
                 if (!hasBorder) {
                     td.style.border = '1px solid #d4d4d4'; // Visible Grid
                 }
                 
                 tr.appendChild(td);
                 
                 // Skip loop if merged
                 if (merge) {
                     c += (merge.e.c - merge.s.c);
                 }
             }

             table.appendChild(tr);
        });

        container.appendChild(table);

        // Render Drawings (Images, Shapes, Connectors)
        this.renderDrawings(sheet, container);
    }

    private renderDrawings(sheet: XlsxSheet, container: HTMLElement) {
        if (!sheet.images?.length && !sheet.shapes?.length && !sheet.connectors?.length) return;

        // Shared Layout Calculation
        const { colWidths, rowHeights } = this.calculateLayoutMetrics(sheet);
        this.colWidths = colWidths;
        this.rowHeights = rowHeights;
        
        const getLeft = (col: number, off: number) => {
             let left = 0;
             for (let c = 0; c < col; c++) left += (colWidths[c + 1] || 64);
             return left + (off / 9525);
        };
        const getTop = (row: number, off: number) => {
             let top = 0;
             for (let r = 0; r < row; r++) top += (rowHeights[r] || 20);
             return top + (off / 9525);
        };

        const getRect = (anchor: any) => {
            const x = getLeft(anchor.from.col, anchor.from.colOff);
            const y = getTop(anchor.from.row, anchor.from.rowOff);
            let w = 0, h = 0;
            
            if (anchor.to) {
                const x2 = getLeft(anchor.to.col, anchor.to.colOff);
                const y2 = getTop(anchor.to.row, anchor.to.rowOff);
                w = max(0, x2 - x);
                h = max(0, y2 - y);
            } else if (anchor.ext) {
                w = anchor.ext.cx / 9525;
                h = anchor.ext.cy / 9525;
            }
            return { x, y, w, h };
        };
        
        const max = Math.max;

        // Create SVG Overlay
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%'; 
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none'; 
        svg.style.overflow = 'visible';
        svg.style.zIndex = '10';

        // Defs for Markers
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Generic Arrow Marker (Standard Triangle) - End
        const markerEnd = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        markerEnd.setAttribute('id', 'arrow-end');
        markerEnd.setAttribute('viewBox', '0 0 10 10');
        markerEnd.setAttribute('refX', '9');
        markerEnd.setAttribute('refY', '5');
        markerEnd.setAttribute('markerWidth', '6');
        markerEnd.setAttribute('markerHeight', '6');
        markerEnd.setAttribute('orient', 'auto');
        markerEnd.setAttribute('markerUnits', 'strokeWidth'); // Scale with line
        const pathEnd = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEnd.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
        pathEnd.setAttribute('fill', 'context-fill'); // Try context-fill for supported browsers or fallback
        // Fallback color handled by logic or multiple markers?
        // Simple fallback: use fill="black" if context logic fails, but we want color.
        // For now, let's use 'black' as base, or just rely on stroke color if line is colored.
        // Actually, easiest is to set fill="currentColor" and set color on the path.
        // But marker is separate element.
        pathEnd.style.fill = 'context-stroke'; // SVG 2
        pathEnd.setAttribute('fill', 'black'); // Fallback
        
        markerEnd.appendChild(pathEnd);
        defs.appendChild(markerEnd);
        
        // Generic Arrow Marker - Start
        const markerStart = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        markerStart.setAttribute('id', 'arrow-start');
        markerStart.setAttribute('viewBox', '0 0 10 10');
        markerStart.setAttribute('refX', '1');
        markerStart.setAttribute('refY', '5');
        markerStart.setAttribute('markerWidth', '6');
        markerStart.setAttribute('markerHeight', '6');
        markerStart.setAttribute('orient', 'auto');
        markerStart.setAttribute('markerUnits', 'strokeWidth');
        const pathStart = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathStart.setAttribute('d', 'M 10 0 L 0 5 L 10 10 z');
        pathStart.style.fill = 'context-stroke';
        pathStart.setAttribute('fill', 'black');
        markerStart.appendChild(pathStart);
        defs.appendChild(markerStart);

        svg.appendChild(defs);

        // ... (Shapes and Images rendering remain similar) ...
        // 1. Shapes
        sheet.shapes?.forEach((shape: OfficeShape) => {
            // ... (Shape rendering) ...
            const rect = getRect(shape.anchor);
            if (rect.w <= 0 || rect.h <= 0) return;

            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            // transform origin is 0,0 of g.
            // translate to x,y
            let transform = `translate(${rect.x}, ${rect.y})`;
            if (shape.rotation) {
                // Rotate around center
                // SVG rotate is degrees. Parser normalized it.
                transform += ` rotate(${shape.rotation}, ${rect.w/2}, ${rect.h/2})`;
            }
            g.setAttribute('transform', transform);

            // Geometry
            let vector: SVGElement;
            if (shape.geometry === 'ellipse') {
                vector = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                vector.setAttribute('cx', String(rect.w / 2));
                vector.setAttribute('cy', String(rect.h / 2));
                vector.setAttribute('rx', String(rect.w / 2));
                vector.setAttribute('ry', String(rect.h / 2));
            } else {
                // Default to rect
                vector = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                vector.setAttribute('width', String(rect.w));
                vector.setAttribute('height', String(rect.h));
                if (shape.geometry === 'roundRect') {
                    vector.setAttribute('rx', String(Math.min(rect.w, rect.h) * 0.15));
                }
            }

            // Fill
            const fill = shape.fill;
            if (fill?.type === 'noFill' || fill?.type === 'none') {
                vector.setAttribute('fill', 'none');
            } else if (fill?.color) {
               vector.setAttribute('fill', this.resolveColor(fill.color));
            } else {
                // Default: Do NOT assume blue. Assume transparent.
                vector.setAttribute('fill', 'none');
            }

            // Stroke
            const stroke = shape.stroke;
            if (stroke) {
                 if (stroke.type === 'noFill') {
                     vector.setAttribute('stroke', 'none');
                 } else {
                     const color = stroke.color ? this.resolveColor(stroke.color) : 'none';
                     if (color === 'none') {
                         vector.setAttribute('stroke', 'none');
                     } else {
                         vector.setAttribute('stroke', color);
                         const w = stroke.width || 0;
                         const widthPt = w > 20 ? w / 12700 : w;
                         vector.setAttribute('stroke-width', String(widthPt || 1)); 
                     }
                 }
            } else {
                vector.setAttribute('stroke', 'none'); 
            }
            
            g.appendChild(vector);

            // Text
            if (shape.textBody && shape.textBody.paragraphs?.length) {
                const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
                fo.setAttribute('width', String(rect.w));
                fo.setAttribute('height', String(rect.h));
                fo.style.pointerEvents = 'none'; 
                
                const div = document.createElement('div');
                div.style.width = '100%';
                div.style.height = '100%';
                div.style.display = 'flex';
                div.style.flexDirection = 'column'; // Paragraphs stack
                // Alignment (vertical center default?)
                div.style.justifyContent = 'center'; 
                div.style.alignItems = 'center'; // Horizontal center default

                // Parse first paragraph/run to get defaults
                const p0 = shape.textBody.paragraphs[0];
                const run0 = p0?.runs?.[0];
                
                if (p0?.alignment === 'left') div.style.alignItems = 'flex-start';
                if (p0?.alignment === 'right') div.style.alignItems = 'flex-end';
                
                div.style.fontFamily = 'Calibri, sans-serif';
                // Font Size
                if (run0?.size) {
                     div.style.fontSize = `${run0.size}pt`;
                } else {
                     div.style.fontSize = '11pt';
                }
                
                // Color
                if (run0?.color) {
                    div.style.color = this.resolveColor(run0.color);
                } else if (shape.textBody.color) { // Legacy mapping
                    div.style.color = this.resolveColor(shape.textBody.color);
                }

                // Render all paragraphs
                shape.textBody.paragraphs.forEach((p: any) => {
                    const pDiv = document.createElement('div');
                    if (p.alignment) pDiv.style.textAlign = p.alignment;
                    
                    p.runs.forEach((run: any) => {
                        const span = document.createElement('span');
                        span.textContent = run.text;
                        if (run.bold) span.style.fontWeight = 'bold';
                        if (run.size) span.style.fontSize = `${run.size}pt`;
                        if (run.color) span.style.color = this.resolveColor(run.color);
                        pDiv.appendChild(span);
                    });
                    div.appendChild(pDiv);
                });
                
                fo.appendChild(div);
                g.appendChild(fo);
            }

            svg.appendChild(g);
        });

        // 2. Images
        sheet.images?.forEach((img: OfficeImage) => {
             const rect = getRect(img.anchor);
             if (rect.w <= 0 || rect.h <= 0) return;

             const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
             image.setAttribute('href', img.src); 
             image.setAttribute('x', String(rect.x));
             image.setAttribute('y', String(rect.y));
             image.setAttribute('width', String(rect.w));
             image.setAttribute('height', String(rect.h));
             
             if (img.rotation) {
                 image.setAttribute('transform', `rotate(${img.rotation}, ${rect.x + rect.w/2}, ${rect.y + rect.h/2})`);
             }
             svg.appendChild(image);
        });

        // 4. Group Shapes
        sheet.groupShapes?.forEach((group: OfficeGroupShape) => {
             this.renderGroup(group, svg, getRect(group.anchor));
        });

        // 3. Connectors (Manhattan Routing)
        sheet.connectors?.forEach((cxn: OfficeConnector) => {
             const x1 = getLeft(cxn.anchor.from.col, cxn.anchor.from.colOff);
             const y1 = getTop(cxn.anchor.from.row, cxn.anchor.from.rowOff);
             let x2 = x1, y2 = y1;
             
             if (cxn.anchor.to) {
                 x2 = getLeft(cxn.anchor.to.col, cxn.anchor.to.colOff);
                 y2 = getTop(cxn.anchor.to.row, cxn.anchor.to.rowOff);
             } else if (cxn.anchor.ext) {
                 x2 = x1 + cxn.anchor.ext.cx / 9525;
                 y2 = y1 + cxn.anchor.ext.cy / 9525;
             }

             // Determine Path
             // Simple "Z" or "L" routing
             let d = `M ${x1} ${y1}`;
             
             // If dist Y > dist X, split vertically
             if (Math.abs(y2 - y1) > Math.abs(x2 - x1)) {
                 const midY = (y1 + y2) / 2;
                 d += ` L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
             } else {
                 const midX = (x1 + x2) / 2;
                 d += ` L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
             }

             const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
             path.setAttribute('d', d);
             path.setAttribute('fill', 'none');
             
             const color = cxn.stroke?.color ? this.resolveColor(cxn.stroke.color) : '#000000';
             const w = cxn.stroke?.width || 0;
             const widthPt = w > 20 ? w / 12700 : (w || 1.5); // Default thicker for connectors
             
             path.setAttribute('stroke', color);
             path.setAttribute('stroke-width', String(widthPt));
             
             // Markers
             if (cxn.startArrow && cxn.startArrow !== 'none') {
                 path.setAttribute('marker-start', 'url(#arrow-start)');
             }
             if (cxn.endArrow && cxn.endArrow !== 'none') {
                 path.setAttribute('marker-end', 'url(#arrow-end)');
             }
             
             svg.appendChild(path);
        });

        container.appendChild(svg);
    }
    
    private renderGroup(group: OfficeGroupShape, container: SVGElement, rect: { x: number, y: number, w: number, h: number }) {
        // Group Container
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Transform for Group Anchor
        let transform = `translate(${rect.x}, ${rect.y})`;
        if (group.rotation) {
             transform += ` rotate(${group.rotation}, ${rect.w/2}, ${rect.h/2})`;
        }
        g.setAttribute('transform', transform);
        
        // Group's own coordinate system?
        // Typically groups have a child coordinate system defined in `grpSpPr` (chOff, chExt).
        // For simplicity, we assume children are relative or we need to scale.
        // TODO: Implement proper chOff/chExt scaling. For now, render children directly if they have relative coords.
        // Actually, our parser assigns 'anchor' to children. If parser passed absolute anchors, we don't need scaling.
        // If parser passed relative, we do. 
        // Current Parser: Passes 'anchor' from parent to children in recursive call (stubbed).
        
        // Render Children
        // We need a helper to render shapes/images/connectors similar to main renderDrawings but appending to 'g'
        
        // This requires refactoring renderDrawings to be reusable or duplicating logic.
        // For today, duplicating the individual shape render logic is safer than massive refactor.
        
        // Render Children
        
        // 1. Shapes
        group.shapes?.forEach(shape => {
             // relative to group logic:
             // For now, calculate relative position if possible, or just render.
             // Since children share parent anchor in current parser stub, they overlap parent.
             
             // We use our helper:
             const childRect = this.getRect(shape.anchor);
             // If childRect is same as group rect (because anchors are same), we want to render at (0,0) inside the group IF group has transform.
             // But if group transform handles the "Group Position", then children inside should be at (0,0) + offset.
             // If offset is 0, they are at 0,0.
             
             const relX = childRect.x - rect.x;
             const relY = childRect.y - rect.y;
             
             this.renderShapeInGroup(shape, g, { x: relX, y: relY, w: childRect.w, h: childRect.h });
        });
        
        container.appendChild(g);
    }
    
    // Helper to extract shape rendering logic
    private renderShapeInGroup(shape: OfficeShape, container: SVGElement, rect: { x: number, y: number, w: number, h: number }) {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            let transform = `translate(${rect.x}, ${rect.y})`;
            if (shape.rotation) {
                transform += ` rotate(${shape.rotation}, ${rect.w/2}, ${rect.h/2})`;
            }
            g.setAttribute('transform', transform);

            let vector: SVGElement;
            if (shape.geometry === 'ellipse') {
                vector = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                vector.setAttribute('cx', String(rect.w / 2));
                vector.setAttribute('cy', String(rect.h / 2));
                vector.setAttribute('rx', String(rect.w / 2));
                vector.setAttribute('ry', String(rect.h / 2));
            } else {
                vector = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                vector.setAttribute('width', String(rect.w));
                vector.setAttribute('height', String(rect.h));
                if (shape.geometry === 'roundRect') {
                    vector.setAttribute('rx', String(Math.min(rect.w, rect.h) * 0.15));
                }
            }

            const fill = shape.fill;
            if (fill?.type === 'noFill' || fill?.type === 'none') {
                vector.setAttribute('fill', 'none');
            } else if (fill?.color) {
               vector.setAttribute('fill', this.resolveColor(fill.color));
            } else {
                vector.setAttribute('fill', 'none');
            }

            const stroke = shape.stroke;
            if (stroke) {
                 if (stroke.type === 'noFill') {
                     vector.setAttribute('stroke', 'none');
                 } else {
                     const color = stroke.color ? this.resolveColor(stroke.color) : 'none';
                     if (color !== 'none') {
                         vector.setAttribute('stroke', color);
                         const w = stroke.width || 0;
                         const widthPt = w > 20 ? w / 12700 : w;
                         vector.setAttribute('stroke-width', String(widthPt || 1)); 
                     }
                 }
            } else {
                vector.setAttribute('stroke', 'none'); 
            }
            
            g.appendChild(vector);
            container.appendChild(g);
    }

    private getRect(anchor: any) {
         if (!anchor || anchor.type !== 'absolute') return { x: 0, y: 0, w: 0, h: 0 };
         
         const getLeft = (col: number, off: number) => {
             let left = 0;
             for (let c = 0; c < col; c++) left += (this.colWidths[c+1] || 64); // 1-based index? verify usage
             // XlsxRenderer.calculateLayoutMetrics colWidths is 0-indexed or 1-indexed?
             // calculateLayoutMetrics: cols[i] -> colWidths[i]. cols seems to be 0-indexed layout.
             // renderDrawings: getLeft uses (c < col). input col is 0-based from parseAnchor? 
             // DrawingParser.parseAnchor uses 'col' textContent. In OOXML 'col' is 0-based.
             return left + (off / 9525);
         };

         const getTop = (row: number, off: number) => {
             let top = 0;
             for (let r = 0; r < row; r++) top += (this.rowHeights[r] || 20);
             return top + (off / 9525);
         };
         
         const x1 = getLeft(anchor.from.col, anchor.from.colOff);
         const y1 = getTop(anchor.from.row, anchor.from.rowOff);
         const x2 = getLeft(anchor.to.col, anchor.to.colOff);
         const y2 = getTop(anchor.to.row, anchor.to.rowOff);
         
         return { x: x1, y: y1, w: Math.max(0, x2 - x1), h: Math.max(0, y2 - y1) };
    }

    private resolveColor(color: string): string {
        if (!color) return '#000000';
        if (color.startsWith('#') || color.startsWith('rgb')) return color;
        
        if (color.startsWith('theme:')) {
             const themeColor = color.replace('theme:', '');
             const theme = this.workbook.theme;
             if (theme?.colorScheme) {
                 const resolved = theme.colorScheme[themeColor];
                 if (resolved) {
                     return resolved.startsWith('#') ? resolved : '#' + resolved; 
                 }
             }
             // Fallback
             if (themeColor === 'tx1') return '#000000';
             if (themeColor === 'bg1') return '#FFFFFF';
             if (themeColor === 'accent1') return '#4472C4'; 
             if (themeColor === 'accent2') return '#ED7D31'; 
             if (themeColor === 'accent3') return '#A5A5A5'; 
             if (themeColor === 'accent4') return '#FFC000'; 
             if (themeColor === 'accent5') return '#5B9BD5'; 
             if (themeColor === 'accent6') return '#70AD47'; 
        }
        return color;
    }

    private calculateLayoutMetrics(sheet: XlsxSheet) {
        const colWidths: number[] = [];
        const rowHeights: number[] = [];
        let maxR = 0; let maxC = 0;
        
        const check = (list: any[] | undefined) => {
            if (!list) return;
            list.forEach(i => {
                if (i.anchor) { 
                      if (i.anchor.to) {
                          maxR = Math.max(maxR, i.anchor.to.row);
                          maxC = Math.max(maxC, i.anchor.to.col);
                      } else {
                          maxR = Math.max(maxR, i.anchor.from.row + 5);
                          maxC = Math.max(maxC, i.anchor.from.col + 5);
                      }
                }
            });
        };
        check(sheet.images);
        check(sheet.shapes);
        check(sheet.connectors);
        
        // Col Widths
        if (sheet.cols) {
            sheet.cols.forEach(c => {
                 // Assume this covers the range
                 // We need to fill colWidths for each index
                 const w = c.width * 7.5;
                 for (let k = c.min; k <= c.max; k++) colWidths[k] = w;
            });
        }
        
        // Row Heights
        if (sheet.rows) {
            Object.values(sheet.rows).forEach(r => {
                if (r.height) rowHeights[r.index] = r.height * 1.33;
                else rowHeights[r.index] = 20;
            });
        }
        
        return { colWidths, rowHeights };
    }
    
    private isMerged(r: number, c: number, merges: any[]): boolean {
        // Return true if (r, c) is INSIDE a merge block but NOT the top-left cell
        for (const m of merges) {
            // Check bounds: s.r <= r <= e.r && s.c <= c <= e.c
            if (r >= m.s.r && r <= m.e.r && c >= m.s.c && c <= m.e.c) {
                // If it is the start cell, it is NOT "overlapped", it IS the merge
                if (r === m.s.r && c === m.s.c) return false;
                return true;
            }
        }
        return false;
    }
    
    private getMergeStart(r: number, c: number, merges: any[]): any | null {
        for (const m of merges) {
             if (r === m.s.r && c === m.s.c) return m;
        }
        return null;
    }
}
