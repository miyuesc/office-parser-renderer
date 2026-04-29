import { FileHandler, parseNumberAttr } from '@opr/shared';
import { DocxAbstractNumbering, DocxNumbering } from '../model';
import { attr, firstChildElementByLocalName, localElements, parseRunProperties, valueOfFirst } from './xml';

export class NumberingParser {
  static parse(xmlString?: string): DocxNumbering {
    const numbering: DocxNumbering = {
      abstractNums: new Map(),
      nums: new Map()
    };

    if (!xmlString) {
      return numbering;
    }

    const doc = FileHandler.parseXML(xmlString);

    for (const abstractNode of localElements(doc, 'abstractNum')) {
      const id = attr(abstractNode, 'abstractNumId');
      if (!id) continue;

      const abstractNum: DocxAbstractNumbering = {
        id,
        levels: new Map()
      };

      for (const levelNode of localElements(abstractNode, 'lvl')) {
        const level = attr(levelNode, 'ilvl') || '0';
        abstractNum.levels.set(level, {
          level,
          start: parseNumberAttr(valueOfFirst(levelNode, 'start'), 1),
          format: valueOfFirst(levelNode, 'numFmt'),
          text: valueOfFirst(levelNode, 'lvlText'),
          textStyle: parseRunProperties(firstChildElementByLocalName(levelNode, 'rPr'))
        });
      }

      numbering.abstractNums.set(id, abstractNum);
    }

    for (const numNode of localElements(doc, 'num')) {
      const id = attr(numNode, 'numId');
      if (!id) continue;

      numbering.nums.set(id, {
        id,
        abstractNumId: valueOfFirst(numNode, 'abstractNumId')
      });
    }

    return numbering;
  }
}
