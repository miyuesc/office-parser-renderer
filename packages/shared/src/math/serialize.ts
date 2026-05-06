import { OfficeMath, OfficeMathNode } from './model';

const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  '=': '⁼',
  '(': '⁽',
  ')': '⁾',
  'n': 'ⁿ',
  'i': 'ⁱ'
};

const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  '+': '₊',
  '-': '₋',
  '=': '₌',
  '(': '₍',
  ')': '₎',
  'a': 'ₐ',
  'e': 'ₑ',
  'h': 'ₕ',
  'i': 'ᵢ',
  'j': 'ⱼ',
  'k': 'ₖ',
  'l': 'ₗ',
  'm': 'ₘ',
  'n': 'ₙ',
  'o': 'ₒ',
  'p': 'ₚ',
  'r': 'ᵣ',
  's': 'ₛ',
  't': 'ₜ',
  'u': 'ᵤ',
  'v': 'ᵥ',
  'x': 'ₓ'
};

export function serializeOfficeMath(value: OfficeMath | OfficeMathNode | undefined): string {
  if (!value) {
    return '';
  }

  return value.type === 'math' ? serializeNode(value.body) : serializeNode(value);
}

function serializeNode(node: OfficeMathNode): string {
  switch (node.type) {
    case 'text':
      return node.text;
    case 'sequence':
      return node.children.map(serializeNode).join('');
    case 'fraction':
      return `(${serializeNode(node.numerator)})/(${serializeNode(node.denominator)})`;
    case 'radical': {
      const degree = node.degree ? serializeNode(node.degree) : '';
      return degree ? `√[${degree}](${serializeNode(node.radicand)})` : `√(${serializeNode(node.radicand)})`;
    }
    case 'superscript':
      return `${serializeNode(node.base)}${toMappedText(node.superscript, SUPERSCRIPT_MAP, '^')}`;
    case 'subscript':
      return `${serializeNode(node.base)}${toMappedText(node.subscript, SUBSCRIPT_MAP, '_')}`;
    case 'subsuperscript':
      return `${serializeNode(node.base)}${toMappedText(node.subscript, SUBSCRIPT_MAP, '_')}${toMappedText(
        node.superscript,
        SUPERSCRIPT_MAP,
        '^'
      )}`;
    case 'delimiter':
      return `${node.begin || '('}${serializeNode(node.body)}${node.end || ')'}`;
    case 'function': {
      const name = serializeNode(node.name);
      const argument = node.argument ? serializeNode(node.argument) : '';
      return argument ? `${name}(${argument})` : name;
    }
    case 'nary': {
      const lower = node.lower ? `_${wrapText(serializeNode(node.lower))}` : '';
      const upper = node.upper ? `^${wrapText(serializeNode(node.upper))}` : '';
      const body = node.body ? ` ${serializeNode(node.body)}` : '';
      return `${node.operator}${lower}${upper}${body}`;
    }
    default:
      return '';
  }
}

function toMappedText(node: OfficeMathNode, map: Record<string, string>, fallbackPrefix: '^' | '_'): string {
  const text = serializeNode(node);
  if (text && [...text].every(char => !!map[char])) {
    return [...text].map(char => map[char]).join('');
  }

  return `${fallbackPrefix}${wrapText(text)}`;
}

function wrapText(text: string): string {
  return text.length === 1 ? text : `(${text})`;
}
