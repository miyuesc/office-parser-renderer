import { OfficeMath, OfficeMathNode, WarningCollector } from '@opr/shared';
import { childElementsByLocalName, firstChildElementByLocalName } from './xml';

export interface MathParserOptions {
  warnings?: WarningCollector;
  partPath?: string;
}

export class MathParser {
  static parse(node: Element, options: MathParserOptions = {}): OfficeMath {
    const unsupported = new Set<string>();
    const displayMode = node.localName === 'oMathPara' ? 'block' : 'inline';

    return {
      type: 'math',
      displayMode,
      body: this.parseRoot(node, options, unsupported)
    };
  }

  private static parseRoot(node: Element, options: MathParserOptions, unsupported: Set<string>): OfficeMathNode {
    if (node.localName === 'oMathPara') {
      const mathChildren = childElementsByLocalName(node, 'oMath');
      if (mathChildren.length > 0) {
        return this.toSequence(mathChildren.map(child => this.parseElement(child, options, unsupported)));
      }
    }

    return this.parseContainer(node, options, unsupported);
  }

  private static parseContainer(node: ParentNode, options: MathParserOptions, unsupported: Set<string>): OfficeMathNode {
    const children: OfficeMathNode[] = [];

    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 1) {
        children.push(this.parseElement(child as Element, options, unsupported));
      } else if (child.nodeType === 3) {
        const text = child.textContent || '';
        if (text.trim()) {
          children.push({ type: 'text', text });
        }
      }
    }

    return this.toSequence(children);
  }

  private static parseElement(node: Element, options: MathParserOptions, unsupported: Set<string>): OfficeMathNode {
    switch (node.localName) {
      case 'oMath':
        return this.parseContainer(node, options, unsupported);
      case 'oMathPara':
        return this.parseRoot(node, options, unsupported);
      case 'r':
        return {
          type: 'text',
          text: childElementsByLocalName(node, 't')
            .map(child => child.textContent || '')
            .join('')
        };
      case 't':
        return { type: 'text', text: node.textContent || '' };
      case 'f':
        return {
          type: 'fraction',
          numerator: this.parseContainer(firstChildElementByLocalName(node, 'num') || node, options, unsupported),
          denominator: this.parseContainer(firstChildElementByLocalName(node, 'den') || node, options, unsupported)
        };
      case 'rad':
        return {
          type: 'radical',
          degree: this.parseOptionalContainer(firstChildElementByLocalName(node, 'deg'), options, unsupported),
          radicand: this.parseContainer(firstChildElementByLocalName(node, 'e') || node, options, unsupported)
        };
      case 'sSup':
        return {
          type: 'superscript',
          base: this.parseContainer(firstChildElementByLocalName(node, 'e') || node, options, unsupported),
          superscript: this.parseContainer(firstChildElementByLocalName(node, 'sup') || node, options, unsupported)
        };
      case 'sSub':
        return {
          type: 'subscript',
          base: this.parseContainer(firstChildElementByLocalName(node, 'e') || node, options, unsupported),
          subscript: this.parseContainer(firstChildElementByLocalName(node, 'sub') || node, options, unsupported)
        };
      case 'sSubSup':
        return {
          type: 'subsuperscript',
          base: this.parseContainer(firstChildElementByLocalName(node, 'e') || node, options, unsupported),
          subscript: this.parseContainer(firstChildElementByLocalName(node, 'sub') || node, options, unsupported),
          superscript: this.parseContainer(firstChildElementByLocalName(node, 'sup') || node, options, unsupported)
        };
      case 'd': {
        const delimiterProps = firstChildElementByLocalName(node, 'dPr');
        return {
          type: 'delimiter',
          begin: this.getValAttr(firstChildElementByLocalName(delimiterProps || node, 'begChr')) || '(',
          end: this.getValAttr(firstChildElementByLocalName(delimiterProps || node, 'endChr')) || ')',
          body: this.parseContainer(firstChildElementByLocalName(node, 'e') || node, options, unsupported)
        };
      }
      case 'func':
        return {
          type: 'function',
          name: this.parseContainer(firstChildElementByLocalName(node, 'fName') || node, options, unsupported),
          argument: this.parseOptionalContainer(firstChildElementByLocalName(node, 'e'), options, unsupported)
        };
      case 'nary': {
        const props = firstChildElementByLocalName(node, 'naryPr');
        return {
          type: 'nary',
          operator: this.getValAttr(firstChildElementByLocalName(props || node, 'chr')) || '∑',
          lower: this.parseOptionalContainer(firstChildElementByLocalName(node, 'sub'), options, unsupported),
          upper: this.parseOptionalContainer(firstChildElementByLocalName(node, 'sup'), options, unsupported),
          body: this.parseOptionalContainer(firstChildElementByLocalName(node, 'e'), options, unsupported)
        };
      }
      case 'box':
      case 'bar':
      case 'acc':
      case 'groupChr':
      case 'limLow':
      case 'limUpp':
      case 'm':
      case 'mr':
      case 'eqArr':
        this.reportUnsupported(node.localName, options, unsupported);
        return this.parseContainer(node, options, unsupported);
      case 'e':
      case 'num':
      case 'den':
      case 'deg':
      case 'sub':
      case 'sup':
      case 'fName':
      case 'mPr':
      case 'dPr':
      case 'naryPr':
      case 'oMathParaPr':
        return this.parseContainer(node, options, unsupported);
      default:
        this.reportUnsupported(node.localName, options, unsupported);
        return this.parseContainer(node, options, unsupported);
    }
  }

  private static parseOptionalContainer(
    node: Element | undefined,
    options: MathParserOptions,
    unsupported: Set<string>
  ): OfficeMathNode | undefined {
    if (!node) {
      return undefined;
    }

    return this.parseContainer(node, options, unsupported);
  }

  private static toSequence(children: OfficeMathNode[]): OfficeMathNode {
    const compact = children.filter(child => !(child.type === 'text' && child.text.length === 0));
    if (compact.length === 0) {
      return { type: 'text', text: '' };
    }
    if (compact.length === 1) {
      return compact[0];
    }

    return {
      type: 'sequence',
      children: compact
    };
  }

  private static reportUnsupported(localName: string, options: MathParserOptions, unsupported: Set<string>) {
    if (unsupported.has(localName)) {
      return;
    }

    unsupported.add(localName);
    options.warnings?.fallbackFeature(`DOCX OMML element uses linear-text fallback: ${localName}`, options.partPath);
  }

  private static getValAttr(node?: Element): string | undefined {
    if (!node) {
      return undefined;
    }

    return node.getAttribute('m:val') || node.getAttribute('val') || undefined;
  }
}
