import { FileHandler, Logger, OfficeImage } from '@opr/shared';

const logger = new Logger('DrawingParser');

export class DrawingParser {
  /**
   * Parse drawing xml to extract images
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
  ): OfficeImage[] {
    const images: OfficeImage[] = [];
    const doc = FileHandler.parseXML(xmlString);

    // Support twoCellAnchor and oneCellAnchor
    const anchors = doc.querySelectorAll('twoCellAnchor, oneCellAnchor');

    for (let i = 0; i < anchors.length; i++) {
      const anchor = anchors[i];
      const type = anchor.tagName.includes('twoCellAnchor') ? 'twoCellAnchor' : 'oneCellAnchor';

      // Find Picture
      const pic = anchor.querySelector('pic');
      if (!pic) continue;

      // 1. Get Image Reference (rId)
      const blip = pic.querySelector('blip');
      const rId = blip?.getAttribute('r:embed');
      if (!rId) continue;

      // 2. Resolve File Path
      let target = rels.get(rId);
      if (!target) continue;

      // Resolve relative path: ../media/image1.png relative to xl/drawings/
      // Simple path resolution
      if (target.startsWith('../')) {
        // xl/drawings/ + ../media/x.png -> xl/media/x.png
        // Split base path: [xl, drawings]
        const baseParts = basePath.split('/').filter(p => p);
        const targetParts = target.split('/');

        while (targetParts[0] === '..') {
          baseParts.pop();
          targetParts.shift();
        }
        target = [...baseParts, ...targetParts].join('/');
      } else {
        // If not starting with .., assume relative to base or absolute? usually relative
        target = basePath + target;
      }

      // 3. Get Blob
      const fileData = files.get(target);
      if (!fileData) {
        logger.warn(`Image file not found: ${target}`);
        continue;
      }

      // Extension
      const ext = target.split('.').pop() || 'png';
      const mimeType = this.getMimeType(ext);
      const blob = new Blob([fileData], { type: mimeType });

      // 4. Parse Transform (position, size, rotation)
      const spPr = pic.querySelector('spPr');
      const xfrm = spPr?.querySelector('xfrm');

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

        // Rotation (unit: 60000th of a degree)
        const rotAttr = xfrm.getAttribute('rot');
        if (rotAttr) {
          rotation = parseInt(rotAttr, 10) / 60000;
        }

        flipH = xfrm.getAttribute('flipH') === '1' || xfrm.getAttribute('flipH') === 'true';
        flipV = xfrm.getAttribute('flipV') === '1' || xfrm.getAttribute('flipV') === 'true';
      }

      // 5. Parse Anchor Position (From/To)
      const fromNode = anchor.querySelector('from');
      const toNode = anchor.querySelector('to');

      const img: OfficeImage = {
        id: rId,
        blob,
        extension: ext,
        position: {
          type: type as any,
          x,
          y,
          width,
          height,
          rotation,
          flipH,
          flipV
        }
      };

      if (fromNode) {
        img.position.from = {
          col: parseInt(fromNode.querySelector('col')?.textContent || '0', 10),
          colOff: this.emuToPx(parseInt(fromNode.querySelector('colOff')?.textContent || '0', 10)),
          row: parseInt(fromNode.querySelector('row')?.textContent || '0', 10),
          rowOff: this.emuToPx(parseInt(fromNode.querySelector('rowOff')?.textContent || '0', 10))
        };
      }

      if (toNode) {
        img.position.to = {
          col: parseInt(toNode.querySelector('col')?.textContent || '0', 10),
          colOff: this.emuToPx(parseInt(toNode.querySelector('colOff')?.textContent || '0', 10)),
          row: parseInt(toNode.querySelector('row')?.textContent || '0', 10),
          rowOff: this.emuToPx(parseInt(toNode.querySelector('rowOff')?.textContent || '0', 10))
        };
      }

      images.push(img);
    }

    return images;
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

  // 1 EMU = 1/914400 inch
  // 1 pixel = 1/96 inch (typically)
  // pixel = EMU * 96 / 914400 = EMU / 9525
  private static emuToPx(emu: number): number {
    return Math.round(emu / 9525);
  }
}
