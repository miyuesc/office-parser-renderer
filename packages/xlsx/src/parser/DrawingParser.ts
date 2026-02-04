import { FileHandler, Logger, OfficeImage, OfficeShape } from '@opr/shared';

const logger = new Logger('DrawingParser');

export class DrawingParser {
  /**
   * Parse drawing xml to extract images and shapes
   * @param xmlString Content of drawing.xml
   * @param rels Relationships map (rId -> target path)
   * @param files All files in zip (for retrieving images)
   * @param basePath Base path of the drawing file (e.g., "xl/drawings/") to resolve relative paths
   */
  static parse(
    xmlString: string,
    rels: Map<string, string>,
    files: Map<string, Uint8Array>,
    basePath: string
  ): (OfficeImage | OfficeShape)[] {
    const drawings: (OfficeImage | OfficeShape)[] = [];
    const doc = FileHandler.parseXML(xmlString);

    // Support twoCellAnchor and oneCellAnchor
    const anchors = doc.querySelectorAll('twoCellAnchor, oneCellAnchor');

    for (let i = 0; i < anchors.length; i++) {
      const anchor = anchors[i];
      const type = anchor.tagName.includes('twoCellAnchor') ? 'twoCellAnchor' : 'oneCellAnchor';

      // 5. Parse Anchor Position (From/To)
      const fromNode = anchor.querySelector('from');
      const toNode = anchor.querySelector('to');
      let fromPos, toPos;

      if (fromNode) {
        fromPos = {
          col: parseInt(fromNode.querySelector('col')?.textContent || '0', 10),
          colOff: this.emuToPx(parseInt(fromNode.querySelector('colOff')?.textContent || '0', 10)),
          row: parseInt(fromNode.querySelector('row')?.textContent || '0', 10),
          rowOff: this.emuToPx(parseInt(fromNode.querySelector('rowOff')?.textContent || '0', 10))
        };
      }

      if (toNode) {
        toPos = {
          col: parseInt(toNode.querySelector('col')?.textContent || '0', 10),
          colOff: this.emuToPx(parseInt(toNode.querySelector('colOff')?.textContent || '0', 10)),
          row: parseInt(toNode.querySelector('row')?.textContent || '0', 10),
          rowOff: this.emuToPx(parseInt(toNode.querySelector('rowOff')?.textContent || '0', 10))
        };
      }

      // 1. Picture (pic)
      const pic = anchor.querySelector('pic');
      if (pic) {
        const image = this.parsePicture(pic, rels, files, basePath);
        if (image) {
          image.position.type = type as any;
          image.position.from = fromPos;
          image.position.to = toPos;
          drawings.push(image);
        }
        continue;
      }

      // 2. Shape (sp) or Connector (cxnSp)
      const sp = anchor.querySelector('sp');
      if (sp) {
        const shape = this.parseShape(sp, 'shape');
        shape.position.type = type as any;
        shape.position.from = fromPos;
        shape.position.to = toPos;
        drawings.push(shape);
        continue;
      }

      const cxnSp = anchor.querySelector('cxnSp');
      if (cxnSp) {
        const shape = this.parseShape(cxnSp, 'connector');
        shape.position.type = type as any;
        shape.position.from = fromPos;
        shape.position.to = toPos;
        drawings.push(shape);
        continue;
      }
    }

    return drawings;
  }

  private static parsePicture(
    pic: Element,
    rels: Map<string, string>,
    files: Map<string, Uint8Array>,
    basePath: string
  ): OfficeImage | null {
    const blip = pic.querySelector('blip');
    const rId = blip?.getAttribute('r:embed');
    if (!rId) return null;

    let target = rels.get(rId);
    if (!target) return null;

    if (target.startsWith('../')) {
      const baseParts = basePath.split('/').filter(p => p);
      const targetParts = target.split('/');

      while (targetParts[0] === '..') {
        baseParts.pop();
        targetParts.shift();
      }
      target = [...baseParts, ...targetParts].join('/');
    } else {
      target = basePath + target;
    }

    const fileData = files.get(target);
    if (!fileData) {
      logger.warn(`Image file not found: ${target}`);
      return null;
    }

    const ext = target.split('.').pop() || 'png';
    const mimeType = this.getMimeType(ext);
    const blob = new Blob([fileData], { type: mimeType });

    const spPr = pic.querySelector('spPr');
    const xfrm = spPr?.querySelector('xfrm');
    const transform = this.parseTransform(xfrm);

    return {
      id: rId,
      blob,
      extension: ext,
      position: {
        type: 'absolute', // Placeholder, will be updated by caller
        ...transform
      }
    };
  }

  private static parseShape(node: Element, type: 'shape' | 'connector'): OfficeShape {
    const nvSpPr = node.querySelector('nvSpPr');
    const cNvPr = nvSpPr?.querySelector('cNvPr');
    const id = cNvPr?.getAttribute('id') || '0';
    const name = cNvPr?.getAttribute('name') || '';

    const spPr = node.querySelector('spPr');
    const xfrm = spPr?.querySelector('xfrm');
    const transform = this.parseTransform(xfrm);

    // Geometry
    const prstGeom = spPr?.querySelector('prstGeom');
    const custGeom = spPr?.querySelector('custGeom');

    let geometry: OfficeShape['geometry'] = { type: 'preset', preset: 'rect' };

    if (prstGeom) {
      const prst = prstGeom.getAttribute('prst') || 'rect';
      logger.info('Parsed Shape Preset:', prst, 'Name:', name);

      const adjustments: Record<string, number> = {};
      const avLst = prstGeom.querySelector('avLst');
      if (avLst) {
        const gds = avLst.querySelectorAll('gd');
        for (let i = 0; i < gds.length; i++) {
          const gdName = gds[i].getAttribute('name');
          const fmla = gds[i].getAttribute('fmla'); // formula like "val 50000"
          if (gdName && fmla && fmla.startsWith('val')) {
            const val = parseInt(fmla.split(' ')[1], 10);
            if (!isNaN(val)) {
              adjustments[gdName] = val; // Often 100000 based
            }
          }
        }
      }

      geometry = {
        type: 'preset',
        preset: prst,
        adjustments
      };
    } else if (custGeom) {
      // TODO: Parse custom geometry path list
      geometry = {
        type: 'custom',
        path: '' // Placeholder
      };
    }

    // Style (Fill/Stroke)
    const fill = this.parseFill(spPr);
    const stroke = this.parseStroke(spPr?.querySelector('ln') || null);

    // Text Body
    const txBody = node.querySelector('txBody');
    const text = this.parseTextBody(txBody);

    return {
      id,
      name,
      type,
      position: {
        type: 'absolute', // Placeholder
        ...transform
      },
      geometry,
      style: {
        fill,
        stroke
      },
      text
    };
  }

  private static parseTransform(xfrm: Element | null | undefined): {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    flipH: boolean;
    flipV: boolean;
  } {
    let x = 0,
      y = 0,
      width = 0,
      height = 0,
      rotation = 0;
    let flipH = false;
    let flipV = false;

    if (xfrm) {
      const off = xfrm.querySelector('off');
      if (off) {
        x = this.emuToPx(parseInt(off.getAttribute('x') || '0', 10));
        y = this.emuToPx(parseInt(off.getAttribute('y') || '0', 10));
      }
      const extSize = xfrm.querySelector('ext');
      if (extSize) {
        width = this.emuToPx(parseInt(extSize.getAttribute('cx') || '0', 10));
        height = this.emuToPx(parseInt(extSize.getAttribute('cy') || '0', 10));
      }

      const rotAttr = xfrm.getAttribute('rot');
      if (rotAttr) {
        rotation = parseInt(rotAttr, 10) / 60000;
      }

      flipH = xfrm.getAttribute('flipH') === '1' || xfrm.getAttribute('flipH') === 'true';
      flipV = xfrm.getAttribute('flipV') === '1' || xfrm.getAttribute('flipV') === 'true';
    }
    return { x, y, width, height, rotation, flipH, flipV };
  }

  private static parseFill(spPr: Element | null | undefined): OfficeShape['style']['fill'] {
    if (!spPr) return undefined;

    // Check for noFill
    if (spPr.querySelector('noFill')) {
      return { type: 'none' };
    }

    // Check for solidFill
    const solidFill = spPr.querySelector('solidFill');
    if (solidFill) {
      const color = this.parseColor(solidFill);
      return { type: 'solid', color };
    }

    // TODO: gradFill, pattFill
    return undefined;
  }

  private static parseStroke(ln: Element | null): OfficeShape['style']['stroke'] {
    if (!ln) return undefined;

    if (ln.querySelector('noFill')) return undefined;

    const wAttr = ln.getAttribute('w');
    const width = wAttr ? this.emuToPx(parseInt(wAttr, 10)) : 1;

    let color = '000000';
    const solidFill = ln.querySelector('solidFill');
    if (solidFill) {
      color = this.parseColor(solidFill) || color;
    }

    return {
      width,
      color,
      type: 'solid' // Simple default
    };
  }

  private static parseTextBody(txBody: Element | null): OfficeShape['text'] {
    if (!txBody) return undefined;

    const paragraphs = txBody.querySelectorAll('p');
    const runsData: any[] = [];
    let fullText = '';

    for (let i = 0; i < paragraphs.length; i++) {
      const runs = paragraphs[i].querySelectorAll('r');
      for (let j = 0; j < runs.length; j++) {
        const t = runs[j].querySelector('t')?.textContent || '';
        fullText += t;
        // TODO: Parse run properties (rPr) for bold/italic/color
        runsData.push({ text: t });
      }
      if (i < paragraphs.length - 1) fullText += '\n';
    }

    if (!fullText) return undefined;

    return {
      content: fullText,
      runs: runsData,
      align: 'center', // Default
      valign: 'middle'
    };
  }

  private static parseColor(container: Element): string | undefined {
    // srgbClr, schemeClr, sysClr, prstClr
    const srgbClr = container.querySelector('srgbClr');
    if (srgbClr) {
      return srgbClr.getAttribute('val') || undefined;
    }

    const schemeClr = container.querySelector('schemeClr');
    if (schemeClr) {
      // We need theme resolver for this. For now return a placeholder or undefined.
      // Or maybe schemeClr val directly if it maps to known ones?
      const val = schemeClr.getAttribute('val');
      if (val === 'tx1') return '000000';
      if (val === 'bg1') return 'FFFFFF';
      if (val === 'accent1') return '4472C4'; // Excel standard accent 1
      return '888888'; // Grey fallback
    }

    return undefined;
  }

  private static getMimeType(ext: string): string {
    switch (ext.toLowerCase()) {
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'gif':
        return 'image/gif';
      case 'bmp':
        return 'image/bmp';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'application/octet-stream';
    }
  }

  private static emuToPx(emu: number): number {
    return Math.round(emu / 9525);
  }
}
