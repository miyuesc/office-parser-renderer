import { ZipService, XmlUtils, LengthUtils } from '@ai-space/shared';
import { PptxDocument, Slide, SlideElement } from '../types';

export class PptxParser {
  async parse(buffer: ArrayBuffer): Promise<PptxDocument> {
    const files = await ZipService.load(buffer);
    const decoder = new TextDecoder();

    const getXml = (path: string) => {
      return files[path] ? decoder.decode(files[path]) : null;
    };

    const presentationXml = getXml('ppt/presentation.xml');
    if (!presentationXml) throw new Error('Invalid PPTX');

    // Parse Master (Simplified: just look for slideMaster1)
    const masterXml = getXml('ppt/slideMasters/slideMaster1.xml');
    let theme: Record<string, unknown> = {};
    if (masterXml) {
      const masterDoc = XmlUtils.parse(masterXml);
      const bg = masterDoc.querySelector('p\\:bg, bg');
      if (bg) {
        const srgbClr = XmlUtils.query(bg, 'a\\:srgbClr, srgbClr');
        if (srgbClr) {
          theme = { backgroundColor: `#${srgbClr.getAttribute('val')}` };
        }
      }
    }

    // Global Image Map (Path -> Blob URL)
    const images: Record<string, string> = {};

    // Helper to load image
    const loadImage = (target: string) => {
      // Target is usually relative like "../media/image1.png" from "ppt/slides/_rels/"
      // So we need to resolve it to "ppt/media/image1.png"

      // Simple normalization:
      const parts = target.split('/');
      const filename = parts[parts.length - 1];
      const cleanPath = `ppt/media/${filename}`;

      if (files[cleanPath] && !images[cleanPath]) {
        const mime = this.getMimeType(filename);
        const blob = new Blob([files[cleanPath]], { type: mime });
        images[cleanPath] = URL.createObjectURL(blob);
      }
      return cleanPath;
    };

    // Parse slides
    const slides: Slide[] = [];
    // Iterate files looking for slides/slideX.xml
    for (const path of Object.keys(files)) {
      const match = path.match(/ppt\/slides\/(slide\d+)\.xml$/);
      if (match) {
        const filename = match[1]; // slide1
        const xml = getXml(path)!;

        // Parse Relationships for this slide
        const relsPath = `ppt/slides/_rels/${filename}.xml.rels`;
        const relsXml = getXml(relsPath);
        const rels: Record<string, string> = {};

        if (relsXml) {
          const relsDoc = XmlUtils.parse(relsXml);
          const relationships = relsDoc.querySelectorAll('Relationship');
          relationships.forEach((r: Element) => {
            const id = r.getAttribute('Id');
            const target = r.getAttribute('Target');
            if (id && target) {
              rels[id] = target;
            }
          });
        }

        slides.push(this.parseSlide(xml, rels, loadImage));
      }
    }

    return {
      slides,
      theme,
      images,
    };
  }

  private parseSlide(
    xml: string,
    rels: Record<string, string>,
    loadImage: (target: string) => string,
  ): Slide {
    const slideDoc = XmlUtils.parse(xml);
    const spTree = slideDoc.querySelector('p\\:spTree, spTree');
    const elements: SlideElement[] = [];

    if (spTree) {
      const children = Array.from(spTree.children);
      for (const child of children) {
        const el = child as Element;
        if (el.tagName.endsWith('sp')) {
          // Shape
          const sp = this.parseShape(el);
          if (sp) elements.push(sp);
        } else if (el.tagName.endsWith('pic')) {
          // Picture
          const pic = this.parsePicture(el, rels, loadImage);
          if (pic) elements.push(pic);
        }
      }
    }

    return {
      id: '1',
      elements,
    };
  }

  private parseShape(node: Element): import('../types').Shape | null {
    // Geometry
    const spPr = XmlUtils.query(node, 'p\\:spPr, spPr');
    if (!spPr) return null;

    const prstGeom = XmlUtils.query(spPr, 'a\\:prstGeom, prstGeom');
    const geom = prstGeom?.getAttribute('prst') || 'rect';

    // Transform
    const xfrm = XmlUtils.query(spPr, 'a\\:xfrm, xfrm');
    const off = xfrm ? XmlUtils.query(xfrm, 'a\\:off, off') : null;
    const ext = xfrm ? XmlUtils.query(xfrm, 'a\\:ext, ext') : null;

    const x = off ? LengthUtils.emusToPixels(parseInt(off.getAttribute('x') || '0')) : 0;
    const y = off ? LengthUtils.emusToPixels(parseInt(off.getAttribute('y') || '0')) : 0;
    const w = ext ? LengthUtils.emusToPixels(parseInt(ext.getAttribute('cx') || '0')) : 0;
    const h = ext ? LengthUtils.emusToPixels(parseInt(ext.getAttribute('cy') || '0')) : 0;

    // Style (Fill/Outline)
    let fill = undefined;
    let outline = undefined;

    // 1. Solid Fill
    const solidFill = XmlUtils.query(spPr, 'a\\:solidFill, solidFill');
    if (solidFill) {
      const srgbClr = XmlUtils.query(solidFill, 'a\\:srgbClr, srgbClr');
      const schemeClr = XmlUtils.query(solidFill, 'a\\:schemeClr, schemeClr');
      if (srgbClr) {
        fill = `#${srgbClr.getAttribute('val')}`;
      } else if (schemeClr) {
        // Placeholder for theme color resolution
        fill = '#cccccc'; // Default for now
      }
    }

    // 2. Outline
    const ln = XmlUtils.query(spPr, 'a\\:ln, ln');
    if (ln) {
      const lnFill = XmlUtils.query(ln, 'a\\:solidFill, solidFill');
      if (lnFill) {
        const lnColor = XmlUtils.query(lnFill, 'a\\:srgbClr, srgbClr');
        if (lnColor) {
          outline = `#${lnColor.getAttribute('val')}`;
        } else {
          outline = '#000000';
        }
      }
    }

    // Text Content (Basic)
    // Check for txBody
    const txBody = XmlUtils.query(node, 'p\\:txBody, txBody');
    if (txBody) {
      // It's a text box or shape with text
      const p = XmlUtils.query(txBody, 'a\\:p, p');
      const r = p ? XmlUtils.query(p, 'a\\:r, r') : null;
      const t = r ? XmlUtils.query(r, 'a\\:t, t') : null;
      if (t && t.textContent) {
        return {
          type: 'textbox', // Treat as textbox or shape with text
          text: t.textContent,
          props: { x, y, w, h, fill, outline },
        } as import('../types').TextBox;
      }
    }

    return {
      type: 'shape',
      geometry: geom,
      props: { x, y, w, h, fill, outline },
    };
  }

  private parsePicture(
    node: Element,
    rels: Record<string, string>,
    loadImage: (target: string) => string,
  ): import('../types').Picture | null {
    const blipFill = XmlUtils.query(node, 'p\\:blipFill, blipFill');
    const blip = XmlUtils.query(blipFill!, 'a\\:blip, blip');
    const embedId = blip?.getAttribute('r:embed');

    if (!embedId) return null;

    const target = rels[embedId];
    const imagePath = target ? loadImage(target) : '';

    const spPr = XmlUtils.query(node, 'p\\:spPr, spPr');
    const xfrm = spPr ? XmlUtils.query(spPr, 'a\\:xfrm, xfrm') : null;
    const off = xfrm ? XmlUtils.query(xfrm, 'a\\:off, off') : null;
    const ext = xfrm ? XmlUtils.query(xfrm, 'a\\:ext, ext') : null;

    const x = off ? LengthUtils.emusToPixels(parseInt(off.getAttribute('x') || '0')) : 0;
    const y = off ? LengthUtils.emusToPixels(parseInt(off.getAttribute('y') || '0')) : 0;
    const w = ext ? LengthUtils.emusToPixels(parseInt(ext.getAttribute('cx') || '0')) : 0;
    const h = ext ? LengthUtils.emusToPixels(parseInt(ext.getAttribute('cy') || '0')) : 0;

    return {
      type: 'picture',
      image: {
        src: imagePath,
        x,
        y,
        w,
        h,
      },
    };
  }

  private getMimeType(filename: string): string {
    if (filename.endsWith('.png')) return 'image/png';
    if (filename.endsWith('.jpeg') || filename.endsWith('.jpg')) return 'image/jpeg';
    if (filename.endsWith('.gif')) return 'image/gif';
    return 'application/octet-stream';
  }
}
