import { FileHandler, getFirstElementByLocalName, type ParagraphStyle } from '@opr/shared';
import { DocxStyle, DocxStyles } from '../model';
import { attr, localElements, parseParagraphProperties, parseRunProperties, valueOfFirst } from './xml';

export class StylesParser {
  static parse(xmlString?: string): DocxStyles {
    const styles: DocxStyles = {
      byId: new Map()
    };

    if (!xmlString) {
      return styles;
    }

    const doc = FileHandler.parseXML(xmlString);
    const docDefaults = getFirstElementByLocalName(doc, 'docDefaults');

    if (docDefaults) {
      const rPrDefault = getFirstElementByLocalName(docDefaults, 'rPrDefault');
      const pPrDefault = getFirstElementByLocalName(docDefaults, 'pPrDefault');
      const run = rPrDefault ? parseRunProperties(getFirstElementByLocalName(rPrDefault, 'rPr')) : undefined;
      const paragraph: ParagraphStyle | undefined = pPrDefault
        ? parseParagraphProperties(getFirstElementByLocalName(pPrDefault, 'pPr')) || {}
        : undefined;

      if (run || paragraph) {
        styles.defaults = { run, paragraph };
      }
    }

    for (const node of localElements(doc, 'style')) {
      const id = attr(node, 'styleId');
      if (!id) {
        continue;
      }

      const rPr = getFirstElementByLocalName(node, 'rPr');
      const pPr = getFirstElementByLocalName(node, 'pPr');
      const style: DocxStyle = {
        id,
        type: attr(node, 'type') || 'paragraph',
        name: valueOfFirst(node, 'name'),
        basedOn: valueOfFirst(node, 'basedOn'),
        next: valueOfFirst(node, 'next'),
        isDefault: attr(node, 'default') === '1',
        text: parseRunProperties(rPr),
        paragraph: parseParagraphProperties(pPr)
      };

      styles.byId.set(id, style);
      if (style.isDefault) {
        this.setDefaultStyleId(styles, style.type, id);
      }
    }

    return styles;
  }

  private static setDefaultStyleId(styles: DocxStyles, type: string, id: string) {
    if (type === 'paragraph') {
      styles.defaultParagraphStyleId = id;
    } else if (type === 'character') {
      styles.defaultCharacterStyleId = id;
    } else if (type === 'table') {
      styles.defaultTableStyleId = id;
    } else if (type === 'numbering') {
      styles.defaultNumberingStyleId = id;
    }
  }
}
