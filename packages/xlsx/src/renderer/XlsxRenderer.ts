import { XlsxWorkbook, XlsxSheet, XlsxRow, XlsxCell, OfficeImage, OfficeShape, OfficeConnector, OfficeGroupShape, OfficeChart } from '../types';
import { CellStyleUtils } from './CellStyleUtils';
import { NumberFormatUtils } from '../utils/NumberFormatUtils';
import { Units, PresetColorMap, generatePresetPath, DefaultThemeColors, mapThemeColor } from '@ai-space/shared';
import { PrstGeom, LineEndType, LineEndWidth, LineEndLength, PatternType } from '../utils/Enums';

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
        this.container.style.overflow = 'hidden'; // 防止容器本身滚动
        this.container.style.backgroundColor = '#f3f2f1'; // Excel-like gray bg

        // 1. Sheet Content Area - 内容区域，内部滚动
        const contentArea = document.createElement('div');
        contentArea.style.flex = '1';
        contentArea.style.minHeight = '0'; // 关键：允许 flex 子元素收缩
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
        if (!sheet.images?.length && !sheet.shapes?.length && !sheet.connectors?.length && !sheet.charts?.length) return;

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
        svg.style.pointerEvents = 'none'; // Container ignores events
        svg.style.overflow = 'visible';
        svg.style.zIndex = '10';


        // Defs for Markers, Gradients, Filters
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
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
            g.style.pointerEvents = 'visiblePainted'; // Enable interaction on content
            const cx = rect.x + rect.w / 2;
            const cy = rect.y + rect.h / 2;

            // 构建 transform：先翻转后旋转（Office 的处理顺序）
            // 注意：SVG transform 从右往左应用，所以要反过来写
            let transforms: string[] = [];

            // 1. 翻转（先应用 = 后写入）
            if (img.flipH || img.flipV) {
                const sx = img.flipH ? -1 : 1;
                const sy = img.flipV ? -1 : 1;
                transforms.push(`translate(${cx}, ${cy}) scale(${sx}, ${sy}) translate(${-cx}, ${-cy})`);
            }

            // 2. 旋转（后应用 = 先写入）
            // OOXML: 正值为顺时针，SVG rotate 也是正值顺时针，无需取反
            if (img.rotation) {
                transforms.unshift(`rotate(${img.rotation}, ${cx}, ${cy})`);
            }

            if (transforms.length > 0) g.setAttribute('transform', transforms.join(' '));

            // Filters (Effects)
            if (img.effects?.length) {
                const filterId = this.resolveFilter(img.effects, ctx);
                if (filterId) g.setAttribute('filter', `url(#${filterId})`);
            }

            const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            image.setAttribute('href', img.src);

            // 检查是否需要交换宽高（旋转 90° 或 270° 时）
            // OOXML 存储的 ext (cx, cy) 是原始尺寸，旋转后视觉尺寸需要交换
            const rot = img.rotation || 0;
            const needSwap = (rot > 45 && rot < 135) || (rot > 225 && rot < 315);
            const renderW = needSwap ? rect.h : rect.w;
            const renderH = needSwap ? rect.w : rect.h;
            // 如果需要交换，调整位置使中心保持不变
            const renderX = needSwap ? rect.x + (rect.w - renderW) / 2 : rect.x;
            const renderY = needSwap ? rect.y + (rect.h - renderH) / 2 : rect.y;

            image.setAttribute('x', String(renderX));
            image.setAttribute('y', String(renderY));
            image.setAttribute('width', String(renderW));
            image.setAttribute('height', String(renderH));
            image.setAttribute('preserveAspectRatio', 'none'); // Scale to fill

            // Clip Path for Rounded Corners (if geometry implies it)
            // Assuming we can detect geometry or standard rounded rect preference
            // TODO: Check if img has geometry property or style defining roundness.
            // For now, if we want to fix "Border Radius", we might check a property.
            // But OfficeImage interface might not have it.
            // If we assume standard "soft edge" or "round" style is applied via effects or we just want to support it if we can find it.
            // Let's add support if `img['geometry']` exists.
            if (img.geometry === 'roundRect') {
                const clipId = `clip-${++ctx.counter}`;
                const clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
                clip.setAttribute('id', clipId);
                const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                clipRect.setAttribute('x', String(renderX));
                clipRect.setAttribute('y', String(renderY));
                clipRect.setAttribute('width', String(renderW));
                clipRect.setAttribute('height', String(renderH));

                // 获取圆角值，支持多种键名：val, adj, adj1（不同 Excel 版本可能不同）
                const val = img.adjustValues?.['adj'] ?? img.adjustValues?.['adj1'] ?? img.adjustValues?.['val'] ?? 16667;
                const radius = Math.min(renderW, renderH) * (val / 100000);
                console.log(`[Image Border Radius] ${img.name}: val=${val}, radius=${radius}px`);

                clipRect.setAttribute('rx', String(radius));
                clipRect.setAttribute('ry', String(radius));
                clip.appendChild(clipRect);
                ctx.defs.appendChild(clip);
                image.setAttribute('clip-path', `url(#${clipId})`);
            }

            g.appendChild(image);

            // Border
            if (img.stroke) {
                const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                const color = img.stroke.color ? this.resolveColor(img.stroke.color) : 'black';
                const strokeWidth = img.stroke.width ? img.stroke.width / 12700 * 1.33 : 1; // Convert EMU to PX
                // Offset border to be OUTSIDE the image
                // x = x - strokeWidth/2, y = y - strokeWidth/2
                // w = w + strokeWidth, h = h + strokeWidth
                border.setAttribute('x', String(renderX - strokeWidth / 2));
                border.setAttribute('y', String(renderY - strokeWidth / 2));
                border.setAttribute('width', String(renderW + strokeWidth));
                border.setAttribute('height', String(renderH + strokeWidth));

                border.setAttribute('fill', 'none');
                border.setAttribute('stroke', this.resolveColor(img.stroke.color));
                border.setAttribute('stroke-width', String(strokeWidth));

                // Match Corner Radius if Image has one
                if (img.geometry === 'roundRect') {
                    // 与 clipPath 使用相同的键名检查逻辑
                    const val = img.adjustValues?.['adj'] ?? img.adjustValues?.['adj1'] ?? img.adjustValues?.['val'] ?? 16667;
                    const radius = Math.min(renderW, renderH) * (val / 100000);
                    border.setAttribute('rx', String(radius));
                    border.setAttribute('ry', String(radius));
                }

                if (img.stroke.dashStyle && img.stroke.dashStyle !== 'solid') {
                    // Simple dash mapping
                    if (img.stroke.dashStyle === 'dash') border.setAttribute('stroke-dasharray', '4 2');
                    if (img.stroke.dashStyle === 'dot') border.setAttribute('stroke-dasharray', '1 1');
                }

                // Line Join/Cap
                if (img.stroke.join) border.setAttribute('stroke-linejoin', img.stroke.join);
                if (img.stroke.cap) border.setAttribute('stroke-linecap', img.stroke.cap);

                // Compound Line (Double/Tri/ThickThin)
                // Using Mask to cut out the gap
                if (img.stroke.compound && img.stroke.compound !== 'sng') {
                    const maskId = `mask-cmpd-${++ctx.counter}`;
                    const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
                    mask.setAttribute('id', maskId);

                    // 1. White base (Visible part)
                    const base = border.cloneNode() as Element;
                    base.setAttribute('stroke', 'white');
                    base.setAttribute('stroke-width', String(strokeWidth));
                    mask.appendChild(base);

                    // 2. Black cut-out (Gap)
                    // Simplified: Assume 'dbl' (1:1:1) or similar.
                    // Cut out the middle 1/3 (or appropriate ratio)
                    const gap = border.cloneNode() as Element;
                    gap.setAttribute('stroke', 'black');

                    let gapWidth = strokeWidth / 3;
                    if (img.stroke.compound === 'thickThin') {
                        // Thick (60) Gap (20) Thin (20)? No, usually offset.
                        // Simple approximation: Cut hole at 20% width?
                        // For now, treat all as 'dbl' for visibility.
                        gapWidth = strokeWidth / 3;
                    }

                    gap.setAttribute('stroke-width', String(gapWidth));
                    mask.appendChild(gap);
                    ctx.defs.appendChild(mask);

                    border.setAttribute('mask', `url(#${maskId})`);
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

            // Normalize geometry type
            const geom = cxn.geometry || cxn.type || 'line';

            if (geom.includes('curved') || geom === 'curvedConnector3') {
                // Quadratic Bezier (curvedConnector3 default)
                // Use adj1 to determine control point offset? 
                // Default heuristic: Control point at corner of bounding box or mid-curve.
                // Simple Quad: M Start Q Control End

                // Identify Control Point
                // Heuristic: Intersection of horizontal from Start and vertical from End (or vice versa)
                // adj1 (50000) determines how close to that corner?

                // Standard Logic for curvedConnector3 (simple arc):
                // M x1 y1 Q (x2, y1) x2 y2 ? Or Q (x1, y2) x2 y2?
                // Depends on direction.

                // If |dx| > |dy|, move Horizontal first?
                let cpx = x2;
                let cpy = y1;

                if (Math.abs(y2 - y1) > Math.abs(x2 - x1)) {
                    // Vertical major
                    cpx = x1;
                    cpy = y2;
                }

                d += ` Q ${cpx} ${cpy} ${x2} ${y2}`;

            } else if (geom.includes('bent') || geom === 'bentConnector2' || geom === 'bentConnector3') {
                // Elbow Connector
                const adj1 = cxn.adjustValues?.['adj1'] ?? 50000;
                const ratio = adj1 / 100000;

                if (geom === 'bentConnector2') {
                    // 2 Segments (1 Corner) - L Shape
                    // Logic: M x1 y1 L x2 y1 L x2 y2 (OR L x1 y2 L x2 y2)
                    // Which one? Depends on direction or adj?
                    // Usually determined by start/end direction (not available here easily without cNvPr)
                    // Heuristic: If |dx| > |dy|, Horizontal first.
                    if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
                        d += ` L ${x2} ${y1} L ${x2} ${y2}`;
                    } else {
                        d += ` L ${x1} ${y2} L ${x2} ${y2}`;
                    }
                } else {
                    // bentConnector3 (Standard 3 segments)
                    if (Math.abs(y2 - y1) > Math.abs(x2 - x1)) {
                        // Vertical Dominance: Down -> Accross -> Down
                        const midY = y1 + (y2 - y1) * ratio;
                        d += ` L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
                    } else {
                        // Horizontal Dominance: Across -> Down -> Across
                        const midX = x1 + (x2 - x1) * ratio;
                        d += ` L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
                    }
                }
            } else {
                // Straight Line (line, straightConnector1)
                d += ` L ${x2} ${y2}`;
            }

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            path.setAttribute('fill', 'none');

            let color = '#000000';
            if (cxn.stroke?.gradient) {
                // Gradient Stroke
                // We need a rect for the connector to resolve gradient coordinates if they are relative?
                // resolveFill uses 'rect' for gradient bounds.
                // We calculated getLeft/Top but didn't make a formal rect object for the whole path.
                // Let's approximate rect or use bounding box of x1/y1/x2/y2.
                const minX = Math.min(x1, x2, ...((cxn.adjustValues ? [/*TODO curve control points*/] : []) as any));
                // Simplified: use x1/x2/y1/y2
                // Actually the path d generation knows bounds.
                const bounds = { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
                // If width/height is 0 (straight line), gradient might fail if using percentages?
                // SVG gradients on strokes usually work along the vector if userSpaceOnUse.
                // But resolveFill uses 0-100% (BoundingBox).
                // If w=0, gradient horizontal is degenerate.
                if (bounds.w === 0) bounds.w = 1;
                if (bounds.h === 0) bounds.h = 1;

                color = this.resolveFill({ type: 'gradient', gradient: cxn.stroke.gradient }, ctx, bounds);
            } else {
                color = cxn.stroke?.color ? this.resolveColor(cxn.stroke.color) : undefined;
            }

            // Fallback to Style if no explicit color
            if (!color && cxn.style?.lnRef?.color) {
                color = this.resolveColor(cxn.style.lnRef.color);
            }
            if (!color) color = '#000000'; // Final Default

            const w = cxn.stroke?.width || 0;
            const widthPt = w > 20 ? w / 12700 : (w || 1.5);

            path.setAttribute('stroke', color);
            path.setAttribute('stroke-width', String(widthPt));


            // Markers
            if (cxn.stroke?.headEnd && cxn.stroke.headEnd.type !== 'none') {
                const mStart = this.resolveMarker(cxn.stroke.headEnd, 'start', ctx, color);
                if (mStart) path.setAttribute('marker-start', `url(#${mStart})`);
            } else if (cxn.startArrow && cxn.startArrow !== 'none') {
                // Fallback for legacy prop using resolveMarker with defaults
                const mStart = this.resolveMarker({ type: cxn.startArrow, w: 'med', len: 'med' }, 'start', ctx, color);
                if (mStart) path.setAttribute('marker-start', `url(#${mStart})`);
            }

            if (cxn.stroke?.tailEnd && cxn.stroke.tailEnd.type !== 'none') {
                const mEnd = this.resolveMarker(cxn.stroke.tailEnd, 'end', ctx, color);
                if (mEnd) path.setAttribute('marker-end', `url(#${mEnd})`);
            } else if (cxn.endArrow && cxn.endArrow !== 'none') {
                // Fallback
                const mEnd = this.resolveMarker({ type: cxn.endArrow, w: 'med', len: 'med' }, 'end', ctx, color);
                if (mEnd) path.setAttribute('marker-end', `url(#${mEnd})`);
            }

            svg.appendChild(path);
        });

        // 5. Charts
        sheet.charts?.forEach((chart: OfficeChart) => {
            const rect = getRect(chart.anchor);
            if (rect.w <= 0 || rect.h <= 0) return;

            this.renderChart(chart, svg, rect, ctx);
        });

        container.appendChild(svg);
    }

    /**
     * 渲染图表
     */
    private renderChart(chart: OfficeChart, container: SVGElement, rect: { x: number, y: number, w: number, h: number }, ctx: any) {
        console.log('Rendering Chart:', chart.title, chart.type);

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${rect.x}, ${rect.y})`);

        // 图表背景
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('width', String(rect.w));
        bg.setAttribute('height', String(rect.h));
        bg.setAttribute('fill', '#ffffff');
        bg.setAttribute('stroke', '#e0e0e0');
        bg.setAttribute('stroke-width', '1');
        g.appendChild(bg);

        // 根据类型渲染
        if (chart.type === 'barChart') {
            this.renderBarChart(chart, g, rect, ctx);
        } else {
            // 占位符
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', String(rect.w / 2));
            text.setAttribute('y', String(rect.h / 2));
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', '#666');
            text.setAttribute('font-size', '14');
            text.textContent = `${chart.title || 'Chart'} (${chart.type})`;
            g.appendChild(text);
        }

        container.appendChild(g);
    }

    /**
     * 渲染柱状图
     */
    private renderBarChart(chart: OfficeChart, container: SVGElement, rect: { x: number, y: number, w: number, h: number }, ctx: any) {
        if (!chart.series.length) return;

        const padding = { top: 40, right: 20, bottom: 50, left: 50 };
        const plotW = rect.w - padding.left - padding.right;
        const plotH = rect.h - padding.top - padding.bottom;

        if (plotW <= 0 || plotH <= 0) return;

        // 绘制标题
        if (chart.title) {
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            title.setAttribute('x', String(rect.w / 2));
            title.setAttribute('y', '25');
            title.setAttribute('text-anchor', 'middle');
            title.setAttribute('font-size', '14');
            title.setAttribute('font-weight', 'bold');
            title.setAttribute('fill', '#333');
            title.textContent = chart.title;
            container.appendChild(title);
        }

        // 计算数据范围
        let maxVal = 0;
        chart.series.forEach(s => {
            s.values.forEach(v => {
                if (!isNaN(v) && v > maxVal) maxVal = v;
            });
        });

        if (maxVal === 0) maxVal = 100;
        else maxVal = Math.ceil(maxVal * 1.1); // 留 10% 余量

        // 绘制 Y 轴网格线和标签
        const numTicks = 5;
        for (let i = 0; i <= numTicks; i++) {
            const val = (maxVal / numTicks) * i;
            const y = padding.top + plotH - (plotH * (i / numTicks));

            // 网格线
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tick.setAttribute('x1', String(padding.left));
            tick.setAttribute('y1', String(y));
            tick.setAttribute('x2', String(padding.left + plotW));
            tick.setAttribute('y2', String(y));
            tick.setAttribute('stroke', '#d9d9d9'); // Light gray
            tick.setAttribute('stroke-width', '1');
            container.appendChild(tick);

            // 标签
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', String(padding.left - 8));
            label.setAttribute('y', String(y));
            label.setAttribute('text-anchor', 'end');
            label.setAttribute('dominant-baseline', 'middle');
            label.setAttribute('font-size', '10');
            label.setAttribute('fill', '#595959');
            label.textContent = Math.round(val).toString();
            container.appendChild(label);
        }

        const categories = chart.series[0]?.categories || [];
        const numCats = categories.length;
        const numSeries = chart.series.length;
        if (numCats === 0) return;

        // 柱宽计算 - Office 风格
        const catW = plotW / numCats;
        // 组间距占分类宽度的 40% (Gap Width = 150% in Office implies distinct separation)
        const groupGap = catW * 0.4;
        const groupW = catW - groupGap;
        // 组内各系列无间距
        const barW = groupW / numSeries;
        const startOffset = groupGap / 2;

        // 主色系 (Office 2007-2010 风格 - Blue, Red, Green, Purple, Aqua, Orange)
        // 匹配截图颜色 (Blue, Red, Green...)
        const colors = ['#4F81BD', '#C0504D', '#9BBB59', '#8064A2', '#4BACC6', '#F79646'];

        // 绘制柱子
        chart.series.forEach((series, si) => {
            const color = series.fillColor ? this.resolveColor(series.fillColor) : colors[si % colors.length];

            series.values.forEach((val, ci) => {
                const safeVal = isNaN(val) ? 0 : val;
                const barH = (safeVal / maxVal) * plotH;
                const x = padding.left + ci * catW + startOffset + si * barW;
                const y = padding.top + (plotH - barH);

                if (barH > 0) {
                    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    bar.setAttribute('x', String(x));
                    bar.setAttribute('y', String(y));
                    bar.setAttribute('width', String(barW));
                    bar.setAttribute('height', String(barH));
                    bar.setAttribute('fill', color);
                    // 为柱状图添加淡淡的边框，以增强对比度
                    bar.setAttribute('stroke', '#ffffff');
                    bar.setAttribute('stroke-width', '0.5');
                    container.appendChild(bar);
                }
            });
        });

        // 绘制 X 轴线
        const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxisLine.setAttribute('x1', String(padding.left));
        xAxisLine.setAttribute('y1', String(padding.top + plotH));
        xAxisLine.setAttribute('x2', String(padding.left + plotW));
        xAxisLine.setAttribute('y2', String(padding.top + plotH));
        xAxisLine.setAttribute('stroke', '#8c8c8c');
        xAxisLine.setAttribute('stroke-width', '1');
        container.appendChild(xAxisLine);

        // 绘制 X 轴标签
        categories.forEach((cat, ci) => {
            const x = padding.left + ci * catW + catW / 2;
            const y = padding.top + plotH + 15;

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', String(x));
            label.setAttribute('y', String(y));
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '10');
            label.setAttribute('fill', '#595959');

            // 简单截断处理防止重叠
            const maxChars = Math.floor(catW / 6);
            label.textContent = cat.length > maxChars ? cat.substring(0, maxChars) + '...' : cat;

            container.appendChild(label);
        });

        // 绘制图例
        const legendY = rect.h - 15;
        const seriesW = 80;
        const totalLegendW = numSeries * seriesW;
        const legendStartX = padding.left + (plotW - totalLegendW) / 2;

        chart.series.forEach((series, si) => {
            const color = series.fillColor ? this.resolveColor(series.fillColor) : colors[si % colors.length];
            const x = legendStartX + si * seriesW;

            const legendRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            legendRect.setAttribute('x', String(x));
            legendRect.setAttribute('y', String(legendY - 8));
            legendRect.setAttribute('width', '10');
            legendRect.setAttribute('height', '10');
            legendRect.setAttribute('fill', color);
            container.appendChild(legendRect);

            const legendText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            legendText.setAttribute('x', String(x + 14));
            legendText.setAttribute('y', String(legendY));
            legendText.setAttribute('font-size', '10');
            legendText.setAttribute('fill', '#595959');
            legendText.textContent = series.name || `Series ${si + 1}`;
            container.appendChild(legendText);
        });
    }

    private renderGroup(group: OfficeGroupShape, container: SVGElement, rect: { x: number, y: number, w: number, h: number }, ctx: any) {
        // Group Container
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        let transform = `translate(${rect.x}, ${rect.y})`;
        if (group.rotation) {
            transform += ` rotate(${group.rotation}, ${rect.w / 2}, ${rect.h / 2})`;
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
        console.log(`Render Shape: [${shape.name}] Geometry: '${shape.geometry}' pathExists: ${!!shape.path} pathLength: ${shape.path?.length || 0}`, shape.adjustValues);
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.style.pointerEvents = 'all'; // Enable interaction (all pointer events)

        let transform = `translate(${rect.x}, ${rect.y})`;
        if (shape.rotation) {
            transform += ` rotate(${shape.rotation}, ${rect.w / 2}, ${rect.h / 2})`;
        }
        g.setAttribute('transform', transform);

        // Filters (Effects)
        if (shape.effects?.length) {
            const filterId = this.resolveFilter(shape.effects, ctx);
            if (filterId) g.setAttribute('filter', `url(#${filterId})`);
        }

        // Add extensive logging for specific inserted elements
        if (shape.name?.includes('矩形 5') || shape.name?.includes('图片')) {
            console.log(`[Detailed Log] Element: ${shape.name}`, {
                geometry: shape.geometry,
                fill: shape.fill,
                stroke: shape.stroke,
                styles: shape.style,
                textBody: shape.textBody
            });
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

                // @ts-ignore
                vector._wrapper = innerSvg;
            } else {
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
            const minDim = Math.min(rect.w, rect.h);
            const radius = minDim * (val / 100000);

            vector.setAttribute('rx', String(radius));
            vector.setAttribute('ry', String(radius));
        } else if (shape.geometry === 'ellipse') {
            // Ellipse geometry
            vector = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            vector.setAttribute('cx', String(rect.w / 2));
            vector.setAttribute('cy', String(rect.h / 2));
            vector.setAttribute('rx', String(rect.w / 2));
            vector.setAttribute('ry', String(rect.h / 2));
        } else if (shape.geometry) {
            // 尝试使用预设路径生成器
            const presetPath = generatePresetPath(shape.geometry, rect.w, rect.h, shape.adjustValues);
            if (presetPath) {
                vector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                vector.setAttribute('d', presetPath);
                // 确保 stroke 不会覆盖 fill 的核心区域
                vector.style.paintOrder = 'stroke fill';
            } else {
                // Default to rect if no preset found
                vector = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                vector.setAttribute('width', String(rect.w));
                vector.setAttribute('height', String(rect.h));
            }
        } else {
            // Default to rect
            vector = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            vector.setAttribute('width', String(rect.w));
            vector.setAttribute('height', String(rect.h));
        }

        // Ensure stroke does not cover fill
        if (vector) vector.style.paintOrder = 'stroke fill';

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
            // Default line join to round for better quality, especially for arbitrary polygons
            vector.setAttribute('stroke-linejoin', 'round');
            vector.setAttribute('stroke-linecap', 'round');
            if (strokeDash !== 'solid') {
                if (strokeDash === 'dash') vector.setAttribute('stroke-dasharray', '4 2');
                if (strokeDash === 'dot') vector.setAttribute('stroke-dasharray', '1 1');
            }
        } else {
            vector.setAttribute('stroke', 'none');
        }

        // Fix for open custom paths (Freeform) being filled by default style
        // If it's a custom path that is NOT closed, and no explicit fill is provided, force none.
        if (shape.geometry === 'custom') {
            // Fix for large coordinates: "vector-effect: non-scaling-stroke"
            // This ensures stroke width is applied in screen pixels, not affected by the massive scaleKey
            vector.setAttribute('vector-effect', 'non-scaling-stroke');
        }

        if (shape.geometry === 'custom' && shape.path) {
            // Strict check: if open path, disable fill UNLESS explicit fill provided?
            // User request: "Arbitrary polygon should not exist fill content" -> likely means default to none.
            // if (!shape.fill) { // REMOVED: Force none even if fill is present (as Excel often defaults to filled but visually it's a line)
            vector.setAttribute('fill', 'none');
            // }
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
            div.style.color = '#ffffff'; // Default text color for inserted shapes is White

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
                    // console.log(`Run: "${run.text}", color: ${JSON.stringify(run.color)}`);
                    const span = document.createElement('span');
                    span.textContent = run.text;
                    if (run.bold) span.style.fontWeight = 'bold';
                    if (run.size) span.style.fontSize = `${run.size}pt`;
                    else span.style.fontSize = '11pt';

                    if (run.color) {
                        span.style.color = this.resolveColor(run.color);
                    } else {
                        span.style.color = 'inherit'; // Explicitly inherit white
                    }

                    if (run.fill && run.fill.type === 'gradient') {
                        span.style.backgroundImage = this.resolveFill(run.fill, ctx, rect, true);
                        span.style.backgroundClip = 'text';
                        // @ts-ignore
                        span.style.webkitBackgroundClip = 'text';
                        span.style.backgroundClip = 'text';
                        span.style.display = 'inline-block'; // Required for transform/gradient sometimes?
                        // span.style.color = 'transparent'; // Handled by inline style usually, but strict check needed
                        span.style.color = 'transparent';
                    }

                    // Apply text shadow effects
                    if (run.effects && run.effects.length > 0) {
                        const shadows: string[] = [];
                        run.effects.forEach((eff: any) => {
                            if (eff.type === 'outerShadow' || eff.type === 'outerShdw') { // Handle both
                                // Parser returns values in pt and degrees
                                const blurRad = (eff.blur || eff.blurRad || 0) * 1.33; // pt to px
                                const dist = (eff.dist || 0) * 1.33; // pt to px
                                const dir = (eff.dir || 0); // degrees
                                const dirRad = (dir * Math.PI) / 180;

                                // Calculate x and y offset from distance and direction
                                const offsetX = Math.round(dist * Math.cos(dirRad));
                                const offsetY = Math.round(dist * Math.sin(dirRad));

                                const shadowColor = eff.color ? this.resolveColor(eff.color) : 'rgba(0,0,0,0.4)';
                                shadows.push(`${offsetX}px ${offsetY}px ${blurRad}px ${shadowColor}`);
                            } else if (eff.type === 'glow') {
                                // Glow is essentially a shadow with 0 offset and specific color/radius
                                const rad = (eff.radius || 0) * 1.33;
                                const color = eff.color ? this.resolveColor(eff.color) : 'gold';
                                shadows.push(`0px 0px ${rad}px ${color}`);
                            }
                        });
                        if (shadows.length > 0) {
                            span.style.textShadow = shadows.join(', ');
                        }
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

        // Handle case where fill is a raw string (theme color or hex)
        if (typeof fill === 'string') {
            return this.resolveColor(fill);
        }

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

            // Convert OOXML angle to SVG gradient coordinates
            // OOXML: 0° = left-to-right, 90° = top-to-bottom
            // SVG: x1,y1 = start, x2,y2 = end (in percentage)
            const angleRad = (angle * Math.PI) / 180;
            // For a 0° horizontal gradient (L→R): x1=0, y1=50, x2=100, y2=50
            // For 90° vertical (T→B): x1=50, y1=0, x2=50, y2=100
            const x1 = 50 - 50 * Math.cos(angleRad);
            const y1 = 50 - 50 * Math.sin(angleRad);
            const x2 = 50 + 50 * Math.cos(angleRad);
            const y2 = 50 + 50 * Math.sin(angleRad);

            lg.setAttribute('x1', `${x1}%`);
            lg.setAttribute('y1', `${y1}%`);
            lg.setAttribute('x2', `${x2}%`);
            lg.setAttribute('y2', `${y2}%`);

            stops.forEach((s: any) => {
                const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop.setAttribute('offset', `${s.position * 100}%`);
                stop.setAttribute('stop-color', this.resolveColor(s.color));
                lg.appendChild(stop);
            });
            ctx.defs.appendChild(lg);
            return `url(#${id})`;
        } else if (fill.type === 'pattern' && fill.pattern) {
            return this.resolvePattern(fill.pattern, ctx);
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
        // Expand filter region to accommodate large shadows
        filter.setAttribute('width', '250%');
        filter.setAttribute('height', '250%');
        filter.setAttribute('x', '-50%');
        filter.setAttribute('y', '-50%');

        let hasFilter = false;

        effects.forEach((eff: any) => {
            if (eff.type === 'outerShadow') {
                hasFilter = true;

                // 详细日志输出阴影参数
                console.log(`[Shadow Effect] blur=${eff.blur}pt, dist=${eff.dist}pt, dir=${eff.dir}°, color=${eff.color}`);

                const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
                blur.setAttribute('in', 'SourceAlpha');
                // blurRad 在解析器中已转换为 PT，1pt ≈ 1.33px
                const stdDev = (eff.blur || 0) * 1.33;
                blur.setAttribute('stdDeviation', String(stdDev > 0 ? stdDev : 2));
                blur.setAttribute('result', 'blurOut');
                filter.appendChild(blur);

                const offset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
                // 计算 dx/dy：dist (PT) 和 dir (Degrees)
                const distPx = (eff.dist || 0) * 1.33; // PT to Px
                // OOXML dir: 0° = 右 (East), 90° = 下 (South)
                // 这与 CSS/数学标准一致，无需转换
                const angleRad = (eff.dir || 0) * (Math.PI / 180);
                const dx = distPx * Math.cos(angleRad);
                const dy = distPx * Math.sin(angleRad);

                console.log(`[Shadow Offset] distPx=${distPx.toFixed(2)}, angle=${eff.dir}° -> dx=${dx.toFixed(2)}, dy=${dy.toFixed(2)}`);

                offset.setAttribute('dx', String(dx));
                offset.setAttribute('dy', String(dy));
                offset.setAttribute('in', 'blurOut');
                offset.setAttribute('result', 'offsetBlur');
                filter.appendChild(offset);

                const flood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
                flood.setAttribute('flood-color', this.resolveColor(eff.color || '#000000'));
                flood.setAttribute('flood-opacity', '0.5'); // 默认阴影透明度
                flood.setAttribute('result', 'floodOut');
                filter.appendChild(flood);

                const composite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
                composite.setAttribute('in', 'floodOut');
                composite.setAttribute('in2', 'offsetBlur');
                composite.setAttribute('operator', 'in');
                composite.setAttribute('result', 'shadowOpt');
                filter.appendChild(composite);

                const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
                // Standard Drop Shadow: Shadow BEHIND SourceGraphic
                const nShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
                nShadow.setAttribute('in', 'shadowOpt');

                const nSource = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
                nSource.setAttribute('in', 'SourceGraphic');

                merge.appendChild(nShadow);
                merge.appendChild(nSource);
                filter.appendChild(merge);
            } else if (eff.type === 'glow') {
                hasFilter = true;
                const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
                const stdDev = (eff.radius || 0) * 1.33;
                blur.setAttribute('stdDeviation', String(stdDev > 0 ? stdDev : 5));
                blur.setAttribute('result', 'coloredBlur');
                filter.appendChild(blur);

                // Glow needs color
                const flood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
                flood.setAttribute('flood-color', this.resolveColor(eff.color || '#FF0000'));
                flood.setAttribute('result', 'glowColor');
                filter.appendChild(flood);

                const composite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
                composite.setAttribute('in', 'glowColor');
                composite.setAttribute('in2', 'coloredBlur');
                composite.setAttribute('operator', 'in');
                composite.setAttribute('result', 'softGlow');
                filter.appendChild(composite);

                const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
                const n1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
                n1.setAttribute('in', 'softGlow');
                const n2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
                n2.setAttribute('in', 'SourceGraphic');
                merge.appendChild(n1);
                merge.appendChild(n2);
                filter.appendChild(merge);
            } else if (eff.type === 'softEdge') {
                hasFilter = true;
                const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
                const stdDev = (eff.radius || 0) * 1.33;
                blur.setAttribute('stdDeviation', String(stdDev > 0 ? stdDev : 5));
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
            for (let c = 0; c < col; c++) left += (this.colWidths[c + 1] || 64);
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
            // Parse theme color with possible modifiers
            // Format: theme:accent1 or theme:accent1:lumMod=75000:lumOff=25000
            const parts = color.split(':');
            const themeColor = parts[1];
            let lumMod: number | undefined;
            let lumOff: number | undefined;
            let tint: number | undefined;
            let shade: number | undefined;
            let alpha: number | undefined;

            // Parse modifiers
            for (let i = 2; i < parts.length; i++) {
                const p = parts[i];
                if (p.startsWith('lumMod=')) lumMod = parseInt(p.split('=')[1], 10);
                if (p.startsWith('lumOff=')) lumOff = parseInt(p.split('=')[1], 10);
                if (p.startsWith('tint=')) tint = parseInt(p.split('=')[1], 10);
                if (p.startsWith('shade=')) shade = parseInt(p.split('=')[1], 10);
                if (p.startsWith('alpha=')) alpha = parseInt(p.split('=')[1], 10);
            }

            let baseColor: string | undefined;

            const theme = this.workbook?.theme;
            if (theme?.colorScheme) {
                const resolved = theme.colorScheme[themeColor];
                if (resolved) {
                    baseColor = resolved.startsWith('#') ? resolved : '#' + resolved;
                }
            }

            // Based on ECMA-376 and Office default theme
            if (!baseColor) {
                const mappedKey = mapThemeColor(themeColor);
                if (mappedKey && DefaultThemeColors[mappedKey]) {
                    baseColor = DefaultThemeColors[mappedKey];
                } else {
                    // Fallback for unmapped or raw keys
                    baseColor = '#000000';
                }
            }

            if (baseColor) {
                return this.applyColorModifiers(baseColor, { lumMod, lumOff, tint, shade, alpha });
            }
        }
        return color;
    }

    // Apply color modifiers (lum, tint, shade, alpha)
    private applyColorModifiers(baseColor: string, mods: { lumMod?: number, lumOff?: number, tint?: number, shade?: number, alpha?: number }): string {
        const { lumMod, lumOff, tint, shade, alpha } = mods;
        if (!lumMod && !lumOff && !tint && !shade && !alpha) return baseColor;

        // Parse hex color
        let hex = baseColor.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }

        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        // Apply Luminance (HSL)
        if (lumMod !== undefined || lumOff !== undefined) {
            // Convert to HSL
            const max = Math.max(r, g, b) / 255;
            const min = Math.min(r, g, b) / 255;
            let h = 0, s = 0, l = (max + min) / 2;

            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (Math.max(r, g, b)) {
                    case r: h = ((g - b) / 255 / d + (g < b ? 6 : 0)) / 6; break;
                    case g: h = ((b - r) / 255 / d + 2) / 6; break;
                    case b: h = ((r - g) / 255 / d + 4) / 6; break;
                }
            }

            if (lumMod !== undefined) l = l * (lumMod / 100000);
            if (lumOff !== undefined) l = l + (lumOff / 100000);
            l = Math.max(0, Math.min(1, l));

            // Back to RGB
            let r2, g2, b2;
            if (s === 0) {
                r2 = g2 = b2 = l;
            } else {
                const hue2rgb = (p: number, q: number, t: number) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r2 = hue2rgb(p, q, h + 1 / 3);
                g2 = hue2rgb(p, q, h);
                b2 = hue2rgb(p, q, h - 1 / 3);
            }
            r = Math.round(r2 * 255);
            g = Math.round(g2 * 255);
            b = Math.round(b2 * 255);
        }

        // Apply Tint/Shade (RGB mixing)
        if (tint !== undefined) {
            const val = tint / 100000;
            // Tint: Mix with White
            r = Math.round(r * val + 255 * (1 - val));
            g = Math.round(g * val + 255 * (1 - val));
            b = Math.round(b * val + 255 * (1 - val));
        }

        if (shade !== undefined) {
            const val = shade / 100000;
            // Shade: Mix with Black
            r = Math.round(r * val);
            g = Math.round(g * val);
            b = Math.round(b * val);
        }

        // Clamp
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        // Alpha
        if (alpha !== undefined) {
            return `rgba(${r}, ${g}, ${b}, ${alpha / 100000})`;
        }

        const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0'); // Round to integer first
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
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

    private resolvePattern(pattern: any, ctx: any): string {
        const id = `patt-${pattern.patternType}-${++ctx.counter}`;
        const patt = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        patt.setAttribute('id', id);
        patt.setAttribute('patternUnits', 'userSpaceOnUse');
        patt.setAttribute('width', '10');
        patt.setAttribute('height', '10');

        // Background
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('width', '10');
        bg.setAttribute('height', '10');
        bg.setAttribute('fill', this.resolveColor(pattern.bgColor || '#ffffff'));
        patt.appendChild(bg);

        // Foreground Path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = '';

        switch (pattern.patternType) {
            case PatternType.DkUpDiag: // Dark Upward Diagonal
            case 'dkUpDiag':
                d = 'M -2,8 L 2,-2 M 0,10 L 10,0 M 8,12 L 12,8';
                break;
            case PatternType.DkDnDiag: // Dark Downward Diagonal
            case 'dkDnDiag':
                d = 'M -2,2 L 2,-2 M 0,0 L 10,10 M 8,8 L 12,12';
                break;
            case PatternType.DkHorz:
            case 'dkHorz':
                d = 'M 0,5 L 10,5';
                break;
            case PatternType.DkVert:
            case 'dkVert':
                d = 'M 5,0 L 5,10';
                break;
            case 'pct50':
                d = 'M 0,0 L 2,0 L 2,2 L 0,2 Z M 5,5 L 7,5 L 7,7 L 5,7 Z';
                break;
            default:
                d = 'M 0,10 L 10,0';
                break;
        }

        path.setAttribute('d', d);
        path.setAttribute('stroke', this.resolveColor(pattern.fgColor || '#000000'));
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-linecap', 'square');
        patt.appendChild(path);

        ctx.defs.appendChild(patt);
        return `url(#${id})`;
    }

    private resolveMarker(end: any, pos: 'start' | 'end', ctx: any, color: string): string | null {
        if (!end || end.type === 'none') return null;

        const type = end.type || 'arrow';
        const w = end.w || 'med';
        const len = end.len || 'med';
        // Sanitize color for ID (remove # and :)
        const colorId = color.replace(/[^a-zA-Z0-9]/g, '');
        const id = `marker-${type}-${w}-${len}-${pos}-${colorId}`;

        if (ctx.defs.querySelector(`#${id}`)) {
            return id;
        }

        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', id);

        // Scale factors logic
        let scaleW = 1;
        if (w === 'sm') scaleW = 0.7; // 0.7
        if (w === 'lg') scaleW = 1.4; // 1.4

        let scaleL = 1;
        if (len === 'sm') scaleL = 0.7; // 0.7
        if (len === 'lg') scaleL = 1.4; // 1.4

        // Use userSpaceOnUse for predictable sizing (independent of stroke width)
        // Standard Arrow size is approx 6px for better proportionality
        const baseSize = 6;
        const mWidth = baseSize * scaleL;
        const mHeight = baseSize * scaleW;

        // ViewBox matches geometry (-10 to 0 in X, -5 to 5 in Y)
        marker.setAttribute('viewBox', '-10 -5 10 10');

        marker.setAttribute('markerWidth', String(mWidth));
        marker.setAttribute('markerHeight', String(mHeight));
        marker.setAttribute('markerUnits', 'userSpaceOnUse');
        marker.setAttribute('orient', 'auto'); // Auto orientation

        // Path Gen
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = '';
        let refX = 0;

        // Base Sizes (matches viewBox/baseSize)
        const lx = 10;
        const wy = 5;

        if (pos === 'start') {
            // For start marker, points Left (Backwards). Base at 0, Tip at -lx.
            if (type === 'triangle' || type === 'arrow') {
                d = `M 0 0 L ${-lx} ${wy} L ${-lx} ${-wy} Z`;
            } else if (type === 'stealth') {
                d = `M 0 0 L ${-lx} ${wy} L ${-lx + lx * 0.3} 0 L ${-lx} ${-wy} Z`;
            } else if (type === 'diamond') {
                d = `M ${lx / 2} 0 L 0 ${-wy} L ${-lx / 2} 0 L 0 ${wy} Z`;
            } else if (type === 'oval') {
                d = `M 0 0 A 5 5 0 1 1 0 0.1`;
            } else {
                d = `M 0 0 L ${-lx} ${wy} L ${-lx} ${-wy} Z`;
            }
            refX = 0; // Attach at base
        } else {
            // End Marker. Point Right (Forward). Base at 0. Tip at lx.
            if (type === 'triangle' || type === 'arrow') {
                d = `M ${-lx} ${-wy} L 0 0 L ${-lx} ${wy} Z`; // Tip at 0, Base at -lx
            } else if (type === 'stealth') {
                d = `M ${-lx} ${-wy} L 0 0 L ${-lx} ${wy} L ${-lx + lx * 0.3} 0 Z`;
            } else if (type === 'diamond') {
                d = `M ${-lx} 0 L ${-lx / 2} ${-wy} L 0 0 L ${-lx / 2} ${wy} Z`;
            } else {
                d = `M ${-lx} ${-wy} L 0 0 L ${-lx} ${wy} Z`;
            }
            refX = 0; // Attach at tip (0,0)
        }

        path.setAttribute('d', d);
        // Explicit fill color
        path.setAttribute('fill', color);
        path.setAttribute('stroke', 'none');

        marker.setAttribute('refX', String(refX));
        marker.setAttribute('refY', '0');
        marker.appendChild(path);

        ctx.defs.appendChild(marker);
        return id;
    }
}
