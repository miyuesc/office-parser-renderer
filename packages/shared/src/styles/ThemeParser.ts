import { FileHandler } from '../core/FileHandler';
import { ColorUtils } from './ColorUtils';
import { ThemeColorKey, ThemeModel, ThemeFontSet } from './types';

const THEME_COLOR_KEYS: ThemeColorKey[] = [
  'lt1',
  'dk1',
  'lt2',
  'dk2',
  'accent1',
  'accent2',
  'accent3',
  'accent4',
  'accent5',
  'accent6',
  'hlink',
  'folHlink'
];

function getLocalName(node: Element): string {
  return node.localName || node.tagName.split(':').pop() || node.tagName;
}

function findFirst(node: ParentNode, localName: string): Element | null {
  const all = node.querySelectorAll('*');
  for (let i = 0; i < all.length; i++) {
    if (getLocalName(all[i]) === localName) {
      return all[i];
    }
  }

  return null;
}

function findChildren(node: Element, localName: string): Element[] {
  const matches: Element[] = [];
  for (let i = 0; i < node.children.length; i++) {
    if (getLocalName(node.children[i]) === localName) {
      matches.push(node.children[i]);
    }
  }
  return matches;
}

export class ThemeParser {
  static parse(xmlString: string): ThemeModel {
    const doc = FileHandler.parseXML(xmlString);
    const themeNode = findFirst(doc, 'theme');

    const theme: ThemeModel = {
      name: themeNode?.getAttribute('name') || undefined,
      colors: {},
      fontScheme: {
        major: {},
        minor: {}
      }
    };

    const clrScheme = findFirst(doc, 'clrScheme');
    if (clrScheme) {
      for (const key of THEME_COLOR_KEYS) {
        const node = findChildren(clrScheme, key)[0];
        const resolved = node ? this.extractColor(node) : undefined;
        if (resolved) {
          theme.colors[key] = resolved;
        }
      }
    }

    const fontScheme = findFirst(doc, 'fontScheme');
    if (fontScheme) {
      theme.fontScheme = {
        major: this.extractFontSet(findChildren(fontScheme, 'majorFont')[0]),
        minor: this.extractFontSet(findChildren(fontScheme, 'minorFont')[0])
      };
    }

    return theme;
  }

  private static extractColor(node: Element): string | undefined {
    const colorNode = findChildren(node, 'srgbClr')[0] || findChildren(node, 'sysClr')[0];
    if (!colorNode) {
      return undefined;
    }

    return ColorUtils.formatColor(colorNode.getAttribute('val') || colorNode.getAttribute('lastClr') || undefined);
  }

  private static extractFontSet(node?: Element): ThemeFontSet {
    if (!node) {
      return {};
    }

    return {
      latin: findChildren(node, 'latin')[0]?.getAttribute('typeface') || undefined,
      eastAsia: findChildren(node, 'ea')[0]?.getAttribute('typeface') || undefined,
      complexScript: findChildren(node, 'cs')[0]?.getAttribute('typeface') || undefined
    };
  }
}
