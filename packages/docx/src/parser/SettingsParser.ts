import { FileHandler } from '@opr/shared';
import { DocxSettings } from '../model';
import { attr, localElements, valueOfFirst } from './xml';

export class SettingsParser {
  static parse(xmlString?: string): DocxSettings {
    const settings: DocxSettings = {
      compatibilityFlags: [],
      unsupported: []
    };

    if (!xmlString) {
      return settings;
    }

    const doc = FileHandler.parseXML(xmlString);
    const defaultTabStop = valueOfFirst(doc, 'defaultTabStop');
    if (defaultTabStop) {
      settings.defaultTabStop = Number(defaultTabStop);
    }

    const compat = localElements(doc, 'compat')[0];
    if (compat) {
      for (const child of Array.from(compat.childNodes)) {
        if (child.nodeType === 1) {
          settings.compatibilityFlags.push((child as Element).localName);
        }
      }
    }

    for (const flag of localElements(doc, 'trackRevisions')) {
      settings.unsupported.push(attr(flag, 'val') === '0' ? 'trackRevisions-disabled' : 'trackRevisions');
    }

    return settings;
  }
}
