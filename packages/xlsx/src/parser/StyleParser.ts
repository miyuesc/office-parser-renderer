
import { XmlUtils } from '@ai-space/shared';
import { XlsxStyles, XlsxFont, XlsxFill, XlsxBorder, XlsxCellXf, XlsxColor, XlsxBorderSide } from '../types';

export class StyleParser {
    static parse(stylesXml: string): XlsxStyles {
        const doc = XmlUtils.parse(stylesXml);
        
        return {
            numFmts: this.parseNumFmts(doc),
            fonts: this.parseFonts(doc),
            fills: this.parseFills(doc),
            borders: this.parseBorders(doc),
            cellXfs: this.parseCellXfs(doc)
        };
    }

    private static parseNumFmts(doc: Document): Record<number, string> {
        const numFmts: Record<number, string> = {
            // Standard Excel formats (partial list)
            0: 'General',
            1: '0',
            2: '0.00',
            3: '#,##0',
            4: '#,##0.00',
            9: '0%',
            10: '0.00%',
            11: '0.00E+00',
            12: '# ?/?',
            13: '# ??/??',
            14: 'mm-dd-yy',
            15: 'd-mmm-yy',
            16: 'd-mmm',
            17: 'mmm-yy',
            18: 'h:mm AM/PM',
            19: 'h:mm:ss AM/PM',
            20: 'h:mm',
            21: 'h:mm:ss',
            22: 'm/d/yy h:mm',
            49: '@'
        };

        const nodes = XmlUtils.queryAll(doc, 'numFmts numFmt');
        nodes.forEach((node: Element) => {
            const id = parseInt(node.getAttribute('numFmtId') || '0', 10);
            const code = node.getAttribute('formatCode');
            if (code) {
                numFmts[id] = code;
            }
        });

        return numFmts;
    }

    private static parseFonts(doc: Document): XlsxFont[] {
        const fonts: XlsxFont[] = [];
        const nodes = XmlUtils.queryAll(doc, 'fonts font');
        nodes.forEach((node: Element) => {
            fonts.push({
                sz: parseInt(XmlUtils.query(node, 'sz')?.getAttribute('val') || '11', 10),
                name: XmlUtils.query(node, 'name')?.getAttribute('val') || 'Calibri',
                b: !!XmlUtils.query(node, 'b'),
                i: !!XmlUtils.query(node, 'i'),
                u: XmlUtils.query(node, 'u') ? (XmlUtils.query(node, 'u')?.getAttribute('val') || true) : undefined,
                strike: !!XmlUtils.query(node, 'strike'),
                color: this.parseColor(XmlUtils.query(node, 'color'))
            });
        });
        return fonts;
    }

    private static parseFills(doc: Document): XlsxFill[] {
        const fills: XlsxFill[] = [];
        const nodes = XmlUtils.queryAll(doc, 'fills fill');
        nodes.forEach((node: Element) => {
            const patternFill = XmlUtils.query(node, 'patternFill');
            if (patternFill) {
                fills.push({
                    patternType: patternFill.getAttribute('patternType') || undefined,
                    fgColor: this.parseColor(XmlUtils.query(patternFill, 'fgColor')),
                    bgColor: this.parseColor(XmlUtils.query(patternFill, 'bgColor'))
                });
            } else {
                fills.push({}); // gradientFill placeholders etc
            }
        });
        return fills;
    }

    private static parseBorders(doc: Document): XlsxBorder[] {
        const borders: XlsxBorder[] = [];
        const nodes = XmlUtils.queryAll(doc, 'borders border');
        nodes.forEach((node: Element) => {
            borders.push({
                left: this.parseBorderSide(XmlUtils.query(node, 'left')),
                right: this.parseBorderSide(XmlUtils.query(node, 'right')),
                top: this.parseBorderSide(XmlUtils.query(node, 'top')),
                bottom: this.parseBorderSide(XmlUtils.query(node, 'bottom')),
                diagonal: this.parseBorderSide(XmlUtils.query(node, 'diagonal'))
            });
        });
        return borders;
    }

    private static parseBorderSide(node: Element | null): XlsxBorderSide | undefined {
        if (!node) return undefined;
        const style = node.getAttribute('style');
        if (!style) return undefined;
        return {
            style,
            color: this.parseColor(XmlUtils.query(node, 'color'))
        }
    }

    private static parseCellXfs(doc: Document): XlsxCellXf[] {
        const cellXfs: XlsxCellXf[] = [];
        const nodes = XmlUtils.queryAll(doc, 'cellXfs xf');
        nodes.forEach((node: Element) => {
            const alignNode = XmlUtils.query(node, 'alignment');
            cellXfs.push({
                numFmtId: parseInt(node.getAttribute('numFmtId') || '0', 10),
                fontId: parseInt(node.getAttribute('fontId') || '0', 10),
                fillId: parseInt(node.getAttribute('fillId') || '0', 10),
                borderId: parseInt(node.getAttribute('borderId') || '0', 10),
                xfId: parseInt(node.getAttribute('xfId') || '0', 10),
                applyAlignment: !!node.getAttribute('applyAlignment'),
                alignment: alignNode ? {
                    horizontal: alignNode.getAttribute('horizontal') as any,
                    vertical: alignNode.getAttribute('vertical') as any,
                    wrapText: !!alignNode.getAttribute('wrapText'),
                    indent: parseInt(alignNode.getAttribute('indent') || '0', 10),
                    textRotation: parseInt(alignNode.getAttribute('textRotation') || '0', 10)
                } : undefined
            });
        });
        return cellXfs;
    }

    private static parseColor(node: Element | null): XlsxColor | undefined {
        if (!node) return undefined;
        const auto = node.getAttribute('auto');
        if (auto) return { auto: true };
        
        const rgb = node.getAttribute('rgb'); // ARGB Hex
        const theme = node.getAttribute('theme');
        const tint = node.getAttribute('tint');
        const indexed = node.getAttribute('indexed');

        return {
            rgb: rgb ? `#${rgb}` : undefined,
            theme: theme ? parseInt(theme, 10) : undefined,
            tint: tint ? parseFloat(tint) : undefined,
            indexed: indexed ? parseInt(indexed, 10) : undefined
        };
    }
}
