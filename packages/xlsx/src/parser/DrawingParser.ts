import { FileHandler, Logger, OfficeImage, OfficeShape, UnitConversion } from '@opr/shared';

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

    // Check for gradFill
    const gradFill = spPr.querySelector('gradFill');
    if (gradFill) {
      const gradient = this.parseGradient(gradFill);
      if (gradient) {
        return {
          type: 'gradient',
          gradient
        };
      }
    }

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

    // Text Body Properties for Warp and Effects
    const bodyPr = txBody.querySelector('bodyPr');
    let warp: NonNullable<OfficeShape['text']>['warp'];
    let bodyEffects: OfficeShape['style']['effects'];

    let wrapText = true; // Default behavior if not specified usually depends, but for shapes often 'square' (wrap)
    if (bodyPr) {
      const wrap = bodyPr.getAttribute('wrap');
      if (wrap === 'none') {
        wrapText = false;
      }

      const prstTxWarp = bodyPr.querySelector('prstTxWarp');
      if (prstTxWarp) {
        const prst = prstTxWarp.getAttribute('prst') || 'textNoShape';
        warp = { preset: prst };
      }
      // Body effects (e.g. shadow on the whole text block? usually on runs, but can be here)
      // bodyEffects = this.parseEffects(bodyPr);
    }

    const paragraphs = txBody.querySelectorAll('p');
    const runsData: NonNullable<OfficeShape['text']>['runs'] = [];
    let fullText = '';
    let align: NonNullable<OfficeShape['text']>['align'] = 'left';

    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      // Paragraph Properties
      const pPr = p.querySelector('pPr');
      if (pPr) {
        const algn = pPr.getAttribute('algn');
        if (algn === 'ctr') align = 'center';
        if (algn === 'r') align = 'right';
      }

      const runs = p.querySelectorAll('r');
      for (let j = 0; j < runs.length; j++) {
        const r = runs[j];
        const t = r.querySelector('t')?.textContent || '';
        if (!t) continue;

        fullText += t;

        const rPr = r.querySelector('rPr');
        const runProps = this.parseRunProps(rPr);

        runsData.push({
          text: t,
          ...runProps
        });
      }
      if (i < paragraphs.length - 1) {
        fullText += '\n';
        // Add a newline run
        runsData.push({ text: '\n' });
      }
    }

    if (!fullText) return undefined;

    return {
      content: fullText,
      runs: runsData,
      align,
      valign: 'middle', // Default, should parse bodyPr anchor
      warp,
      wrap: wrapText
    };
  }

  private static parseRunProps(rPr: Element | null) {
    if (!rPr) return {};

    const bold = rPr.getAttribute('b') === '1';
    const italic = rPr.getAttribute('i') === '1';

    let size = 11;
    const szAttr = rPr.getAttribute('sz'); // sizes are in 100th of a point
    if (szAttr) {
      size = parseInt(szAttr, 10) / 100;
      size = UnitConversion.ptToPixel(size);
    }

    // Fonts
    let font = 'Arial';
    const latin = rPr.querySelector('latin');
    const ea = rPr.querySelector('ea');
    if (ea) {
      font = ea.getAttribute('typeface') || font;
    } else if (latin) {
      font = latin.getAttribute('typeface') || 'Arial';
    }

    // Fill (Text Color/Gradient)
    let fill: NonNullable<NonNullable<OfficeShape['text']>['runs']>[0]['fill'] = { type: 'solid', color: '000000' };

    if (rPr.querySelector('noFill')) {
      fill = { type: 'none' };
    } else {
      const solidFill = rPr.querySelector('solidFill');
      if (solidFill) {
        const color = this.parseColor(solidFill);
        fill = { type: 'solid', color };
      } else {
        const gradFill = rPr.querySelector('gradFill');
        if (gradFill) {
          const gradient = this.parseGradient(gradFill);
          if (gradient) {
            fill = { type: 'gradient', gradient };
          }
        } else {
          const pattFill = rPr.querySelector('pattFill');
          if (pattFill) {
            const pattern = this.parsePattern(pattFill);
            if (pattern) {
              fill = { type: 'pattern', pattern };
            }
          }
        }
      }
    }

    // Outline
    let outline: NonNullable<NonNullable<OfficeShape['text']>['runs']>[0]['outline'];
    const ln = rPr.querySelector('ln');
    if (ln) {
      const stroke = this.parseStroke(ln);
      if (stroke) {
        outline = {
          color: stroke.color || '000000',
          width: stroke.width || 1
        };
      }
    }

    // Effects
    const effects = this.parseEffects(rPr);

    return {
      bold,
      italic,
      size,
      font,
      fill,
      outline,
      effects
    };
  }

  private static parseEffects(container: Element): OfficeShape['style']['effects'] {
    const effects: OfficeShape['style']['effects'] = {};
    const effectLst = container.querySelector('effectLst');
    if (!effectLst) return undefined;

    // Shadow (outerShdw)
    const outerShdw = effectLst.querySelector('outerShdw');
    if (outerShdw) {
      const blurRad = parseInt(outerShdw.getAttribute('blurRad') || '0', 10);
      const dist = parseInt(outerShdw.getAttribute('dist') || '0', 10); // Not directly x/y
      const dir = parseInt(outerShdw.getAttribute('dir') || '0', 10); // Angle in 60000th of degree

      // Convert polar (dist, dir) to Cartesian (x, y)
      // dir is 60000ths of a degree. 0 is top? or right? usually right is 0 in math, but in OA...
      // Actually usually Excel 0 is right, increasing clockwise (screen coords).
      const angleRad = (dir / 60000) * (Math.PI / 180);
      const distPx = this.emuToPx(dist);

      const offsetX = distPx * Math.cos(angleRad);
      const offsetY = distPx * Math.sin(angleRad);

      const color = this.parseColor(outerShdw) || '000000';

      effects.shadow = {
        color,
        blur: this.emuToPx(blurRad),
        offsetX,
        offsetY
      };
    }

    // Glow
    const glow = effectLst.querySelector('glow');
    if (glow) {
      const rad = parseInt(glow.getAttribute('rad') || '0', 10);
      const color = this.parseColor(glow) || 'FFD700'; // Gold default
      effects.glow = {
        color,
        radius: this.emuToPx(rad)
      };
    }

    return Object.keys(effects).length > 0 ? effects : undefined;
  }

  private static parseGradient(gradFill: Element): NonNullable<OfficeShape['style']['fill']>['gradient'] | undefined {
    const gsLst = gradFill.querySelector('gsLst');
    if (!gsLst) return undefined;

    const stops: Array<{ position: number; color: string }> = [];
    const gss = gsLst.querySelectorAll('gs');

    for (let i = 0; i < gss.length; i++) {
      const posStr = gss[i].getAttribute('pos'); // 0 to 100000
      const pos = parseInt(posStr || '0', 10) / 100000;
      const color = this.parseColor(gss[i]) || '000000';
      stops.push({ position: pos, color });
    }

    // Angle
    const lin = gradFill.querySelector('lin');
    let angle = 90;
    if (lin) {
      const angAttr = lin.getAttribute('ang');
      if (angAttr) {
        angle = parseInt(angAttr, 10) / 60000;
        // Adjust to CSS angle (0 is up in some logical, but usually 90 is width-wise)
        // Excel: 0 is horizontal (left to right), 90 is vertical (up to down)
        // CSS Linear Gradient: 90deg is up? No, 90deg is right.
        // SVG: transform rotate.
        // Let's assume standard degree for now.
      }
    }

    return {
      type: 'linear', // Assume linear for now (path is radial/rect)
      angle,
      stops
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
      if (val === 'tx2') return '444444';
      if (val === 'bg1') return 'FFFFFF';
      if (val === 'bg2') return 'E7E6E6';
      if (val === 'accent1') return '4472C4';
      if (val === 'accent2') return 'ED7D31';
      if (val === 'accent3') return 'A5A5A5';
      if (val === 'accent4') return 'FFC000';
      if (val === 'accent5') return '5B9BD5';
      if (val === 'accent6') return '70AD47';
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

  private static parsePattern(pattFill: Element): NonNullable<OfficeShape['style']['fill']>['pattern'] | undefined {
    const prst = pattFill.getAttribute('prst');
    if (!prst) return undefined;

    const fgClrNode = pattFill.querySelector('fgClr');
    const bgClrNode = pattFill.querySelector('bgClr');

    const fgColor = (fgClrNode ? this.parseColor(fgClrNode) : '000000') || '000000';
    const bgColor = (bgClrNode ? this.parseColor(bgClrNode) : 'FFFFFF') || 'FFFFFF';

    return {
      preset: prst,
      foregroundColor: fgColor,
      backgroundColor: bgColor
    };
  }

  private static emuToPx(emu: number): number {
    return Math.round(emu / 9525);
  }
}
