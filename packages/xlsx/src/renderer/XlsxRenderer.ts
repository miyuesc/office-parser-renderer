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

        // Defs for Markers, Gradients, Filters
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

        // Helper to resolve fills/filters into defs
        const ctx = { defs, counter: 0 };

        // 1. Shapes
        sheet.shapes?.forEach((shape: OfficeShape) => {
            const rect = getRect(shape.anchor);
            if (rect.w <= 0 || rect.h <= 0) return;
            this.renderShapeInGroup(shape, svg, rect, ctx); // Reuse main render logic
        });

        // 2. Images
        sheet.images?.forEach((img: OfficeImage) => {
             const rect = getRect(img.anchor);
             if (rect.w <= 0 || rect.h <= 0) return;

             const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
             const cx = rect.x + rect.w/2;
             const cy = rect.y + rect.h/2;

             if (img.rotation) {
                 g.setAttribute('transform', `rotate(${img.rotation * 60000}, ${cx}, ${cy})`); 
                 // Wait, rotation from parser is already normalized? 
                 // Parser: if (style.rotation) rotation = style.rotation.
                 // In parseShapeProperties: result.rotation = rot / 60000.
                 // So img.rotation is in degrees.
                 g.setAttribute('transform', `rotate(${img.rotation}, ${cx}, ${cy})`);
             }
             
             // Filters (Effects)
             if (img.effects?.length) {
                 const filterId = this.resolveFilter(img.effects, ctx);
                 if (filterId) g.setAttribute('filter', `url(#${filterId})`);
             }

             const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
             image.setAttribute('href', img.src); 
             image.setAttribute('x', String(rect.x));
             image.setAttribute('y', String(rect.y));
             image.setAttribute('width', String(rect.w));
             image.setAttribute('height', String(rect.h));
             
             g.appendChild(image);

             // Border
             if (img.stroke) {
                 const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                 border.setAttribute('x', String(rect.x));
                 border.setAttribute('y', String(rect.y));
                 border.setAttribute('width', String(rect.w));
                 border.setAttribute('height', String(rect.h));
                 border.setAttribute('fill', 'none');
                 const color = img.stroke.color ? this.resolveColor(img.stroke.color) : 'black';
                 border.setAttribute('stroke', color);
                 const widthPt = img.stroke.width ? img.stroke.width / 12700 : 1;
                 border.setAttribute('stroke-width', String(widthPt));
                 
                 if (img.stroke.dashStyle && img.stroke.dashStyle !== 'solid') {
                     // Simple dash mapping
                     if (img.stroke.dashStyle === 'dash') border.setAttribute('stroke-dasharray', '4 2');
                     if (img.stroke.dashStyle === 'dot') border.setAttribute('stroke-dasharray', '1 1');
                 }

                 g.appendChild(border);
             }
             
             svg.appendChild(g);
        });
        
        // 4. Group Shapes (Moved order? No, keeps same)

        // 4. Group Shapes
        sheet.groupShapes?.forEach((group: OfficeGroupShape) => {
             this.renderGroup(group, svg, getRect(group.anchor), ctx);
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
             let d = `M ${x1} ${y1}`;
             
             if (cxn.type?.includes('curved') || cxn.geometry?.includes('curved')) {
                 // Cubic Bezier
                 // Use adjust values if available
                 const adj1 = cxn.adjustValues?.['adj1'] ?? 50000;
                 const adj2 = cxn.adjustValues?.['adj2'] ?? 50000;

                 // If vertical dominance, we assume standard S-curve
                 if (Math.abs(y2 - y1) > Math.abs(x2 - x1)) {
                      // Internal logic for CurvedConnector4 often implies tangents at start/end
                      // For vertical flow:
                      // CP1 is (x1, y1 + h*adj1%)
                      // CP2 is (x2, y2 - h*adj2%) ? OR based on direction.
                      // Heuristic:
                      const h = y2 - y1;
                      const cp1x = x1;
                      const cp1y = y1 + h * (adj1 / 100000); 
                      const cp2x = x2;
                      const cp2y = y2 - h * (adj2 / 100000); // Usually adj2 is distance from end?
                      
                      // Try to match "standard" visualization where it curves out then in.
                      // If adj1/adj2 are 50000 (0.5), it puts CPs at midpoint Y but kept at X1/X2 x-coords.
                      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
                 } else {
                      const w = x2 - x1;
                      const cp1x = x1 + w * (adj1 / 100000);
                      const cp1y = y1;
                      const cp2x = x2 - w * (adj2 / 100000);
                      const cp2y = y2;
                      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
                 }
             } else if (cxn.type?.includes('bent') || cxn.geometry?.includes('bent')) {
                 // Bent Connector
                 const adj1 = cxn.adjustValues?.['adj1'] ?? 50000;
                 const ratio = adj1 / 100000;
                 
                 if (Math.abs(y2 - y1) > Math.abs(x2 - x1)) {
                     // Vertical Dominance
                     const midY = y1 + (y2 - y1) * ratio;
                     d += ` L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
                 } else {
                     // Horizontal Dominance
                     const midX = x1 + (x2 - x1) * ratio;
                     d += ` L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
                 }
             } else {
                 // Straight Line or fallback
                 d += ` L ${x2} ${y2}`;
             }

             const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
             path.setAttribute('d', d);
             path.setAttribute('fill', 'none');
             
             const color = cxn.stroke?.color ? this.resolveColor(cxn.stroke.color) : '#000000';
             const w = cxn.stroke?.width || 0;
             const widthPt = w > 20 ? w / 12700 : (w || 1.5); 
             
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
    
    private renderGroup(group: OfficeGroupShape, container: SVGElement, rect: { x: number, y: number, w: number, h: number }, ctx: any) {
        // Group Container
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        let transform = `translate(${rect.x}, ${rect.y})`;
        if (group.rotation) {
             transform += ` rotate(${group.rotation}, ${rect.w/2}, ${rect.h/2})`;
        }
        g.setAttribute('transform', transform);
        
        // Render Children
        // 1. Shapes
        group.shapes?.forEach(shape => {
             const childRect = this.getRect(shape.anchor);
             const relX = childRect.x - rect.x;
             const relY = childRect.y - rect.y;
             
             this.renderShapeInGroup(shape, g, { x: relX, y: relY, w: childRect.w, h: childRect.h }, ctx);
        });
        
        container.appendChild(g);
    }
    
    // Helper to extract shape rendering logic
    private renderShapeInGroup(shape: OfficeShape, container: SVGElement, rect: { x: number, y: number, w: number, h: number }, ctx: any) {
        console.log(`Render Shape: [${shape.name}] Geometry: '${shape.geometry}'`, shape.adjustValues);
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            let transform = `translate(${rect.x}, ${rect.y})`;
            if (shape.rotation) {
                transform += ` rotate(${shape.rotation}, ${rect.w/2}, ${rect.h/2})`;
            }
            g.setAttribute('transform', transform);

            // Filters (Effects)
            if (shape.effects?.length) {
                const filterId = this.resolveFilter(shape.effects, ctx);
                if (filterId) g.setAttribute('filter', `url(#${filterId})`);
            }

            let vector: SVGElement;
            if (shape.geometry === 'custom' && shape.path) {
                vector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                vector.setAttribute('d', shape.path);
                // Custom path is usually in internal coordinates (EMU or abstract).
                // We need to scale it to fit rect.w/h.
                if (shape.pathWidth && shape.pathHeight && shape.pathWidth > 0 && shape.pathHeight > 0) {
                     // Wrap in an inner SVG to handle scaling via viewBox
                     const innerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                     innerSvg.setAttribute('viewBox', `0 0 ${shape.pathWidth} ${shape.pathHeight}`);
                     innerSvg.setAttribute('width', String(rect.w));
                     innerSvg.setAttribute('height', String(rect.h));
                     innerSvg.setAttribute('preserveAspectRatio', 'none'); 
                     innerSvg.style.overflow = 'visible';
                     
                     vector.setAttribute('d', shape.path);
                     innerSvg.appendChild(vector);
                     
                     // We need to append innerSvg to g, but wait, we need to apply fill/stroke to vector?
                     // Or apply to vector and vector is inside innerSvg? Yes.
                     // But 'vector' variable is used later for fill/stroke setting.
                     // So we should repurpose 'vector' to be the innerSvg for appending, 
                     // OR keep vector as path and handle structure change.
                     // The logic below sets attributes on 'vector'.
                     // If I change 'vector' to be 'innerSvg', setAttribute('fill') etc might fail or not work on <svg> root (it does work usually but specificity?)
                     // Better: Set attributes on the PATH (vector), and append PATH to innerSVG.
                     // And append innerSVG to G.
                     // To minimize code change, let's keep 'vector' as the element we modify style on (the path),
                     // and at the end append the 'wrapper' (innerSvg) to 'g' instead of 'vector' directly.
                     
                     // wrapper hack
                     // @ts-ignore
                     vector._wrapper = innerSvg; 
                } else {
                    // Fallback: Just render path string, maybe it's normalized 0-1 or something?
                    // Or 0..21600. If it is 0..21600, we could use that as default viewBox.
                    // Many preset shapes use 21600x21600.
                     const innerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                     innerSvg.setAttribute('viewBox', `0 0 21600 21600`); // Educated guess for default
                     innerSvg.setAttribute('width', String(rect.w));
                     innerSvg.setAttribute('height', String(rect.h));
                     innerSvg.setAttribute('preserveAspectRatio', 'none');
                     innerSvg.style.overflow = 'visible';
                     vector.setAttribute('d', shape.path);
                     innerSvg.appendChild(vector);
                     // @ts-ignore
                     vector._wrapper = innerSvg;
                }
            } else if (shape.geometry === 'roundRect') {
                vector = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                vector.setAttribute('width', String(rect.w));
                vector.setAttribute('height', String(rect.h));
                
                // radius = min(w, h) * val / 100000
                const val = shape.adjustValues?.['val'] ?? 16667;
                console.log(`Rendering roundRect [${shape.name}] val=${val}`, shape.adjustValues);
                const minDim = Math.min(rect.w, rect.h);
                const radius = minDim * (val / 100000);
                
                vector.setAttribute('rx', String(radius));
                vector.setAttribute('ry', String(radius));
            } else if (shape.geometry === 'round2SameRect' || shape.geometry === 'round2SameRect ' || shape.geometry === 'round2SameRect\n') {
                // Top-Left and Top-Right rounded
                const val = shape.adjustValues?.['adj1'] ?? shape.adjustValues?.['val'] ?? 16667;
                console.log(`Rendering round2SameRect [${shape.name}] val=${val}`);
                
                const minDim = Math.min(rect.w, rect.h);
                const r = minDim * (val / 100000);
                
                // M 0 r A r r 0 0 1 r 0 L w-r 0 A r r 0 0 1 w r L w h L 0 h Z
                // Ensure r is not > w/2 or h
                const safeR = Math.min(r, rect.w / 2, rect.h);
                
                 const d = `M 0 ${safeR} A ${safeR} ${safeR} 0 0 1 ${safeR} 0 L ${rect.w - safeR} 0 A ${safeR} ${safeR} 0 0 1 ${rect.w} ${safeR} L ${rect.w} ${rect.h} L 0 ${rect.h} Z`;
                
                vector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                vector.setAttribute('d', d);
            } else if (shape.geometry === 'bentConnector2') {
                // Elbow Connector
                // adj1: default 50000 (50%)
                const adj = shape.adjustValues?.['adj'] ?? 50000;
                const ratio = adj / 100000;
                
                // Standard Elbow: Assume Z/L shape based on dimension or standard
                // If it connects, start/end points dictate. Here we use bounding box.
                // Case 1: Horizontal dominance (w > h). 
                // M 0 0 L w*ratio 0 L w*ratio h L w h. (Z-shape vertical drop)
                // Case 2: Vertical dominance (h > w).
                // M 0 0 L 0 h*ratio L w h*ratio L w h. (Z-shape horizontal traverse)
                
                let d = '';
                if (rect.w > rect.h) {
                     const midX = rect.w * ratio;
                     d = `M 0 0 L ${midX} 0 L ${midX} ${rect.h} L ${rect.w} ${rect.h}`;
                } else {
                     const midY = rect.h * ratio;
                     d = `M 0 0 L 0 ${midY} L ${rect.w} ${midY} L ${rect.w} ${rect.h}`;
                }
                
                vector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                vector.setAttribute('d', d);
                vector.setAttribute('fill', 'none'); 
            } else if (shape.geometry === 'curvedConnector4') {
                // Cubic Bezier Connector
                // adj1, adj2. 
                // Default: adj1=50000, adj2=50000 (?)
                const adj1 = shape.adjustValues?.['adj1'] !== undefined ? shape.adjustValues['adj1'] : 50000;
                const adj2 = shape.adjustValues?.['adj2'] !== undefined ? shape.adjustValues['adj2'] : 50000;
                
                // M 0 0 C cp1x cp1y, cp2x cp2y, w h
                // If vertical dominance (h > w):
                // cp1y = h * (adj1 / 100000) ??
                // Actually adj1 is often tangent magnitude?
                // If we check drawing1.xml, adj1 = -10141, adj2 = 78168.
                // Negative value implies "backward" or "upward" (if Y).
                
                // Heuristic:
                // CP1 = (w/2, h * adj1/100000) ? 
                // If adj1 is negative, it goes up? 
                
                let cp1x, cp1y, cp2x, cp2y;
                
                if (rect.h > rect.w) {
                    // Vertical
                    cp1x = rect.w / 2;
                    cp1y = rect.h * (adj1 / 100000);
                    cp2x = rect.w / 2;
                    cp2y = rect.h * (adj2 / 100000);
                    
                    // If adj1 < 0, maybe it means from START (0,0), Y is 0 + h*adj?
                    // 0 + (-10%) = -10%. (0, -10).
                    // If adj2 is 78%, Y is h*0.78.
                    // This seems plausible for internal control points.
                    
                    // Fallback to minimal separation
                    if (Math.abs(cp1y) < 1) cp1y = rect.h * 0.25;
                    if (Math.abs(cp2y) < 1) cp2y = rect.h * 0.75;
                } else {
                    // Horizontal
                     cp1x = rect.w * (adj1 / 100000);
                     cp1y = rect.h / 2;
                     cp2x = rect.w * (adj2 / 100000);
                     cp2y = rect.h / 2;
                }
                
                // For better curve, use X diff for Vertical? 
                // Actually standard curved connector has CP1x = 0? 
                // M 0 0 C 0 cp1y, w cp2y, w h ?? (Tangents parallel to Y axis)
                // This creates a smooth S curve if CPs are vertical.
                
                if (rect.h > rect.w) {
                     // Vertical tangent
                     const d = `M 0 0 C 0 ${rect.h * (adj1/100000)} ${rect.w} ${rect.w * (adj2/100000)} ${rect.w} ${rect.h}`;
                     // Wait, second control point X should be w?
                     // C cp1x cp1y cp2x cp2y endx endy
                     // Tangent at Start: (0, 1) vector? -> CP1 = (0, y1).
                     // Tangent at End: (0, -1) vector? -> CP2 = (w, y2).
                     
                     // Try:
                     // M 0 0 C 0 ${rect.h * (Math.abs(adj1)/100000)} ${rect.w} ${rect.h - rect.h * (Math.abs(adj2)/100000)} ${rect.w} ${rect.h}
                     // But adj values are signed.
                     // drawing1.xml: adj1=-10141 (up/back?), adj2=78168 (down/forward?)
                     
                     // Let's blindly trust the value as coordinate scalar?
                     // M 0 0 C 0 ${rect.h * (adj1/100000)} ${rect.w} ${rect.h * (adj2/100000)} ${rect.w} ${rect.h}
                    //  This implies CP1 X=0, CP2 X=w. Vertical tangents.
                    
                    vector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    vector.setAttribute('d', `M 0 0 C 0 ${rect.h * (Math.abs(adj1)/100000)} ${rect.w} ${rect.h * (Math.abs(adj2)/100000)} ${rect.w} ${rect.h}`);
                } else {
                    // Horizontal tangent
                    // M 0 0 C ${w*adj1} 0 ${w*adj2} h w h
                     vector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                     const c1 = rect.w * (Math.abs(adj1)/100000);
                     const c2 = rect.w * (Math.abs(adj2)/100000);
                     vector.setAttribute('d', `M 0 0 C ${c1} 0 ${c2} ${rect.h} ${rect.w} ${rect.h}`);
                }
                
                vector.setAttribute('fill', 'none');
            } else {
                // Default to rect
                vector = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                vector.setAttribute('width', String(rect.w));
                vector.setAttribute('height', String(rect.h));
            }

            // Fill
            let fill = this.resolveFill(shape.fill, ctx, rect);
            
            // Fallback to Style if no fill (and not explicitly noFill)
            if (fill === 'none' && shape.style && shape.style.fillRef && !shape.fill) {
                 // Heuristic: If style.fillRef exists, use its color.
                 // idx 0 is often 'subtle' or 'none', but usually idx > 0 implies a fill.
                 // Typically theme styles use accent1, accent2... based on column in style matrix.
                 // We only have the color reference from parseStyle (e.g. theme:accent1).
                 if (shape.style.fillRef.idx > 0 && shape.style.fillRef.color) {
                     fill = this.resolveColor(shape.style.fillRef.color);
                 }
            }
            
            vector.setAttribute('fill', fill);
            
            // Stroke
            const stroke = shape.stroke;
            let strokeColor = 'none';
            let strokeWidth = 0;
            let strokeDash = 'solid';
            
            if (stroke) {
                 if (stroke.type === 'noFill') {
                     strokeColor = 'none';
                 } else {
                     strokeColor = stroke.color ? this.resolveColor(stroke.color) : 'none';
                     
                     // Gradient Stroke
                     if (stroke.gradient) {
                         strokeColor = this.resolveFill({ type: 'gradient', gradient: stroke.gradient }, ctx, rect);
                     }
                     
                     strokeWidth = stroke.width || 0;
                     strokeDash = stroke.dashStyle || 'solid';
                 }
            } else if (shape.style && shape.style.lnRef) {
                 // Fallback to Style
                 if (shape.style.lnRef.idx > 0 && shape.style.lnRef.color) {
                      strokeColor = this.resolveColor(shape.style.lnRef.color);
                      // Default style width?
                      strokeWidth = 9525; // 0.75pt approx
                 }
            }

            if (strokeColor !== 'none') {
                 vector.setAttribute('stroke', strokeColor);
                 const widthPt = strokeWidth > 20 ? strokeWidth / 12700 : strokeWidth;
                 vector.setAttribute('stroke-width', String(widthPt || 1));
                 if (strokeDash !== 'solid') {
                     if (strokeDash === 'dash') vector.setAttribute('stroke-dasharray', '4 2');
                     if (strokeDash === 'dot') vector.setAttribute('stroke-dasharray', '1 1');
                 }
            } else {
                vector.setAttribute('stroke', 'none'); 
            }
            
            // @ts-ignore
            if (vector._wrapper) {
                 // @ts-ignore
                 g.appendChild(vector._wrapper);
            } else {
                 g.appendChild(vector);
            }
            // Text Rendering
            if (shape.textBody) {
                const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
                fo.setAttribute('x', '0');
                fo.setAttribute('y', '0');
                fo.setAttribute('width', String(rect.w));
                fo.setAttribute('height', String(rect.h));
                fo.style.overflow = 'visible'; 
                
                const div = document.createElement('div');
                div.style.width = '100%';
                div.style.height = '100%';
                div.style.display = 'flex';
                div.style.flexDirection = 'column';
                div.style.boxSizing = 'border-box';
                
                // Vertical Alignment
                // Vertical Alignment
                const va = shape.textBody.verticalAlignment || 'top';
                if (va === 'top') div.style.justifyContent = 'flex-start';
                else if (va === 'middle' || va === 'ctr') div.style.justifyContent = 'center';
                else if (va === 'bottom' || va === 'b') div.style.justifyContent = 'flex-end';
                else if (va === 'justified' || va === 'distributed') div.style.justifyContent = 'space-between';
                else div.style.justifyContent = 'flex-start'; // Default
                
                 // Padding
                if (shape.textBody.padding) {
                     const pad = shape.textBody.padding;
                     div.style.paddingLeft = `${pad.left}pt`;
                     div.style.paddingTop = `${pad.top}pt`;
                     div.style.paddingRight = `${pad.right}pt`;
                     div.style.paddingBottom = `${pad.bottom}pt`;
                }
                
                // Render Paragraphs
                 shape.textBody.paragraphs.forEach((p: any) => {
                    const pDiv = document.createElement('div');
                    if (p.alignment) pDiv.style.textAlign = p.alignment;
                    
                    p.runs.forEach((run: any) => {
                        const span = document.createElement('span');
                        span.textContent = run.text;
                        if (run.bold) span.style.fontWeight = 'bold';
                        if (run.size) span.style.fontSize = `${run.size}pt`;
                        else span.style.fontSize = '11pt'; 
                        
                        if (run.color) {
                             span.style.color = this.resolveColor(run.color);
                        }
                        
                         if (run.fill && run.fill.type === 'gradient') {
                             span.style.backgroundImage = this.resolveFill(run.fill, ctx, rect, true);
                             span.style.backgroundClip = 'text';
                             // @ts-ignore
                             span.style.webkitBackgroundClip = 'text';
                             span.style.color = 'transparent';
                        }
                        
                        pDiv.appendChild(span);
                    });
                    div.appendChild(pDiv);
                 });
                 
                 fo.appendChild(div);
                 g.appendChild(fo);
            }

            container.appendChild(g);
    }

    
    private resolveFill(fill: any, ctx: any, rect: any, asCss: boolean = false): string {
        if (!fill) return 'none';
        if (fill.type === 'solid') {
             return this.resolveColor(fill.color || '#000000');
        } else if (fill.type === 'gradient' && fill.gradient) {
             // Create linear gradient
             const id = `grad-${++ctx.counter}`;
             const stops = fill.gradient.stops;
             const angle = fill.gradient.angle || 90;
             
             if (asCss) {
                 // Return CSS gradient
                 const stopStr = stops.map((s: any) => `${this.resolveColor(s.color)} ${s.position * 100}%`).join(', ');
                 return `linear-gradient(${angle}deg, ${stopStr})`;
             }
             
             const lg = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
             lg.setAttribute('id', id);
             // Approximate angle to x1,y1,x2,y2 is complex.
             // Simplification: vertical default
             lg.setAttribute('x1', '0%');
             lg.setAttribute('y1', '0%');
             lg.setAttribute('x2', '0%');
             lg.setAttribute('y2', '100%');
             // TODO: Handle rotation/angle properly
             
             stops.forEach((s: any) => {
                 const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                 stop.setAttribute('offset', `${s.position * 100}%`);
                 stop.setAttribute('stop-color', this.resolveColor(s.color));
                 lg.appendChild(stop);
             });
             ctx.defs.appendChild(lg);
             return `url(#${id})`;
        } else if (fill.type === 'pattern') {
             // Pattern not fully supported yet, fallback solid
             return this.resolveColor(fill.pattern?.fgColor || '#cccccc');
        } else if (fill.type === 'noFill' || fill.type === 'none') {
             return 'none';
        }
        return 'none';
    }
    
    private resolveFilter(effects: any[], ctx: any): string | null {
        if (!effects || !effects.length) return null;
        
        const id = `filter-${++ctx.counter}`;
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', id);
        filter.setAttribute('width', '200%');
        filter.setAttribute('height', '200%');
        filter.setAttribute('x', '-50%');
        filter.setAttribute('y', '-50%');
        
        let hasFilter = false;
        
        effects.forEach((eff: any) => {
            if (eff.type === 'outerShadow') {
                hasFilter = true;
                const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
                blur.setAttribute('in', 'SourceAlpha');
                blur.setAttribute('stdDeviation', String(eff.blur || 2));
                filter.appendChild(blur);
                
                const offset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
                offset.setAttribute('dx', String(eff.dist || 3));
                offset.setAttribute('dy', String(eff.dist || 3));
                offset.setAttribute('result', 'offsetblur');
                filter.appendChild(offset);
                
                const flood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
                flood.setAttribute('flood-color', this.resolveColor(eff.color || '#000000'));
                filter.appendChild(flood);
                
                const composite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
                composite.setAttribute('in2', 'offsetblur');
                composite.setAttribute('operator', 'in');
                filter.appendChild(composite);
                
                const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
                const n1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
                const n2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
                n2.setAttribute('in', 'SourceGraphic');
                merge.appendChild(n1);
                merge.appendChild(n2);
                filter.appendChild(merge);
            } else if (eff.type === 'glow') {
                 // Simple glow implementation
                 hasFilter = true;
                 const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
                 blur.setAttribute('stdDeviation', String(eff.radius || 5));
                 blur.setAttribute('result', 'coloredBlur');
                 filter.appendChild(blur);
                 
                 const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
                 const n1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
                 n1.setAttribute('in', 'coloredBlur');
                 const n2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
                 n2.setAttribute('in', 'SourceGraphic');
                 merge.appendChild(n1);
                 merge.appendChild(n2);
                 filter.appendChild(merge);
                 merge.appendChild(n2);
                 filter.appendChild(merge);
            } else if (eff.type === 'reflection') {
                 hasFilter = true;
                 // Reflection is hard in SVG 1.1 Filter.
                 // We can mimic it by duplicating the object, flipping it, and masking it.
                 // BUT 'filter' applies to the element. We can't easily duplicate it inside a filter.
                 // Best we can do in filter is maybe offset + blur? No, that's shadow.
                 // Real reflection requires DOM duplication or -webkit-box-reflect.
                 // Since we are in browser, we can try CSS on the 'g' element?
                 // But 'renderShapeInGroup' applies filter via url(#...).
                 // Let's skip complex reflection in 'filter' and handle it in CSS if possible, 
                 // OR allow a simplified "drop shadow looking like reflection".
                 
                 // However, we can try to use feImage... complex.
                 // Let's implement Soft Edge here.
                 
            } else if (eff.type === 'softEdge') {
                 hasFilter = true;
                 const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
                 blur.setAttribute('stdDeviation', String(eff.radius || 5));
                 filter.appendChild(blur);
            }
        });
        
        if (!hasFilter) return null;
        
        ctx.defs.appendChild(filter);
        return id;
    }

    private getRect(anchor: any) {
         if (!anchor || anchor.type !== 'absolute') return { x: 0, y: 0, w: 0, h: 0 };
         
         const getLeft = (col: number, off: number) => {
             let left = 0;
             for (let c = 0; c < col; c++) left += (this.colWidths[c+1] || 64); 
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
