import { columnNameToIndex } from '../model/WorksheetAccess';
import { Cell, Styles, Worksheet } from '../parser/types';

const FORMULA_ERROR = Symbol('conditional-formula-error');

type FormulaScalar = string | number | boolean | undefined | typeof FORMULA_ERROR;

type TokenType = 'number' | 'string' | 'boolean' | 'reference' | 'identifier' | 'operator' | 'paren' | 'comma';

interface Token {
  type: TokenType;
  value: string;
}

interface ConditionalFormulaContext {
  worksheet: Worksheet;
  styles?: Styles;
  currentRow: number;
  currentCol: number;
  anchorRow: number;
  anchorCol: number;
}

interface ReferenceAddress {
  row: number;
  col: number;
}

interface ReferenceResolution {
  address?: ReferenceAddress;
  value: FormulaScalar;
}

export class ConditionalFormulaEvaluator {
  static evaluateBoolean(formula: string, context: ConditionalFormulaContext) {
    return this.toBoolean(this.evaluateInternal(formula, context));
  }

  static evaluateScalar(formula: string, context: ConditionalFormulaContext): string | number | boolean | undefined {
    const result = this.evaluateInternal(formula, context);
    return result === FORMULA_ERROR ? undefined : result;
  }

  private static evaluateInternal(formula: string, context: ConditionalFormulaContext): FormulaScalar {
    try {
      const parser = new FormulaParser(formula, context);
      return parser.parse();
    } catch {
      return undefined;
    }
  }

  static toBoolean(value: FormulaScalar) {
    if (value === FORMULA_ERROR || value === undefined) {
      return false;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value !== 0 && !Number.isNaN(value);
    }

    const normalized = value.trim();
    if (!normalized) {
      return false;
    }

    if (/^true$/i.test(normalized)) {
      return true;
    }

    if (/^false$/i.test(normalized)) {
      return false;
    }

    return true;
  }
}

class FormulaParser {
  private readonly tokens: Token[];
  private index = 0;

  constructor(formula: string, private readonly context: ConditionalFormulaContext) {
    this.tokens = tokenizeFormula(formula);
  }

  parse(): FormulaScalar {
    if (this.tokens.length === 0) {
      return undefined;
    }

    const value = this.parseComparison();
    return this.peek() ? undefined : value;
  }

  private parseComparison(): FormulaScalar {
    let left = this.parseConcatenation();

    while (this.peekOperator(['=', '<>', '<', '<=', '>', '>='])) {
      const operator = this.consume()!.value;
      const right = this.parseConcatenation();
      left = compareFormulaValues(left, right, operator);
    }

    return left;
  }

  private parseConcatenation(): FormulaScalar {
    let left = this.parseAdditive();

    while (this.matchOperator('&')) {
      left = stringifyFormulaValue(left) + stringifyFormulaValue(this.parseAdditive());
    }

    return left;
  }

  private parseAdditive(): FormulaScalar {
    let left = this.parseMultiplicative();

    while (this.peekOperator(['+', '-'])) {
      const operator = this.consume()!.value;
      const right = this.parseMultiplicative();
      const leftNumber = toFormulaNumber(left);
      const rightNumber = toFormulaNumber(right);
      if (leftNumber === FORMULA_ERROR || rightNumber === FORMULA_ERROR) {
        left = FORMULA_ERROR;
        continue;
      }

      left = operator === '+' ? leftNumber + rightNumber : leftNumber - rightNumber;
    }

    return left;
  }

  private parseMultiplicative(): FormulaScalar {
    let left = this.parseUnary();

    while (this.peekOperator(['*', '/'])) {
      const operator = this.consume()!.value;
      const right = this.parseUnary();
      const leftNumber = toFormulaNumber(left);
      const rightNumber = toFormulaNumber(right);
      if (leftNumber === FORMULA_ERROR || rightNumber === FORMULA_ERROR) {
        left = FORMULA_ERROR;
        continue;
      }

      if (operator === '/' && rightNumber === 0) {
        left = FORMULA_ERROR;
        continue;
      }

      left = operator === '*' ? leftNumber * rightNumber : leftNumber / rightNumber;
    }

    return left;
  }

  private parseUnary(): FormulaScalar {
    if (this.matchOperator('+')) {
      return this.parseUnary();
    }

    if (this.matchOperator('-')) {
      const value = toFormulaNumber(this.parseUnary());
      return value === FORMULA_ERROR ? FORMULA_ERROR : -value;
    }

    return this.parsePrimary();
  }

  private parsePrimary(): FormulaScalar {
    const token = this.peek();
    if (!token) {
      return undefined;
    }

    if (token.type === 'number') {
      this.consume();
      return Number(token.value);
    }

    if (token.type === 'string') {
      this.consume();
      return token.value;
    }

    if (token.type === 'boolean') {
      this.consume();
      return token.value.toUpperCase() === 'TRUE';
    }

    if (token.type === 'reference') {
      this.consume();
      return this.resolveReference(token.value).value;
    }

    if (token.type === 'identifier') {
      this.consume();
      if (this.matchParen('(')) {
        return this.parseFunctionCall(token.value);
      }
      return undefined;
    }

    if (this.matchParen('(')) {
      const value = this.parseComparison();
      return this.matchParen(')') ? value : undefined;
    }

    return undefined;
  }

  private parseFunctionCall(name: string): FormulaScalar {
    const upperName = name.toUpperCase();

    if (upperName === 'ROW' || upperName === 'COLUMN') {
      const reference = this.tryParseReferenceArgument();
      const resolved = reference?.address;
      if (!this.matchParen(')')) {
        return undefined;
      }

      if (!resolved) {
        return upperName === 'ROW' ? this.context.currentRow : this.context.currentCol;
      }

      return upperName === 'ROW' ? resolved.row : resolved.col;
    }

    const args: FormulaScalar[] = [];
    if (!this.matchParen(')')) {
      do {
        args.push(this.parseComparison());
      } while (this.matchComma());

      if (!this.matchParen(')')) {
        return undefined;
      }
    }

    switch (upperName) {
      case 'AND':
        return args.every(value => ConditionalFormulaEvaluator.toBoolean(value));
      case 'OR':
        return args.some(value => ConditionalFormulaEvaluator.toBoolean(value));
      case 'NOT':
        return !ConditionalFormulaEvaluator.toBoolean(args[0]);
      case 'MOD': {
        const left = toFormulaNumber(args[0]);
        const right = toFormulaNumber(args[1]);
        if (left === FORMULA_ERROR || right === FORMULA_ERROR || right === 0) {
          return FORMULA_ERROR;
        }
        return left % right;
      }
      case 'LEN':
        return stringifyFormulaValue(args[0]).length;
      case 'TRIM':
        return stringifyFormulaValue(args[0]).trim().replace(/\s+/g, ' ');
      case 'ISBLANK':
        return isBlankFormulaValue(args[0]);
      case 'ISERROR':
        return args[0] === FORMULA_ERROR;
      case 'ISNUMBER':
        return typeof args[0] === 'number' && Number.isFinite(args[0]);
      case 'SEARCH': {
        const needle = stringifyFormulaValue(args[0]).toLowerCase();
        const haystack = stringifyFormulaValue(args[1]).toLowerCase();
        if (!needle) {
          return 1;
        }

        const index = haystack.indexOf(needle);
        return index >= 0 ? index + 1 : FORMULA_ERROR;
      }
      case 'ABS': {
        const value = toFormulaNumber(args[0]);
        return value === FORMULA_ERROR ? FORMULA_ERROR : Math.abs(value);
      }
      case 'IF':
        return ConditionalFormulaEvaluator.toBoolean(args[0]) ? args[1] : args[2];
      default:
        return undefined;
    }
  }

  private tryParseReferenceArgument(): ReferenceResolution | undefined {
    if (this.matchParen(')')) {
      this.index -= 1;
      return undefined;
    }

    const token = this.peek();
    if (!token) {
      return undefined;
    }

    if (token.type === 'reference') {
      this.consume();
      return this.resolveReference(token.value);
    }

    const value = this.parseComparison();
    return { value };
  }

  private resolveReference(reference: string): ReferenceResolution {
    const rawRef = reference.includes('!') ? reference.slice(reference.lastIndexOf('!') + 1) : reference;
    const match = rawRef.toUpperCase().match(/^(\$?)([A-Z]+)(\$?)([1-9][0-9]*)$/);
    if (!match) {
      return { value: undefined };
    }

    const [, absoluteCol, colName, absoluteRow, rowValue] = match;
    const baseCol = columnNameToIndex(colName);
    const baseRow = parseInt(rowValue, 10);

    const rowOffset = this.context.currentRow - this.context.anchorRow;
    const colOffset = this.context.currentCol - this.context.anchorCol;

    const row = absoluteRow ? baseRow : baseRow + rowOffset;
    const col = absoluteCol ? baseCol : baseCol + colOffset;
    if (row < 1 || col < 1) {
      return { value: undefined };
    }

    return {
      address: { row, col },
      value: getCellFormulaValue(this.context.worksheet.rows.get(row)?.cells.get(col))
    };
  }

  private peek() {
    return this.tokens[this.index];
  }

  private consume() {
    const token = this.tokens[this.index];
    this.index += 1;
    return token;
  }

  private matchOperator(operator: string) {
    const token = this.peek();
    if (token?.type === 'operator' && token.value === operator) {
      this.index += 1;
      return true;
    }

    return false;
  }

  private peekOperator(operators: string[]) {
    const token = this.peek();
    return token?.type === 'operator' && operators.includes(token.value);
  }

  private matchParen(value: '(' | ')') {
    const token = this.peek();
    if (token?.type === 'paren' && token.value === value) {
      this.index += 1;
      return true;
    }

    return false;
  }

  private matchComma() {
    const token = this.peek();
    if (token?.type === 'comma') {
      this.index += 1;
      return true;
    }

    return false;
  }
}

function tokenizeFormula(formula: string): Token[] {
  const normalized = formula.trim().replace(/^=/, '');
  const tokens: Token[] = [];
  let index = 0;

  while (index < normalized.length) {
    const current = normalized[index];

    if (/\s/.test(current)) {
      index += 1;
      continue;
    }

    const rest = normalized.slice(index);

    const referenceMatch = rest.match(/^(?:(?:'[^']+'|[A-Za-z0-9_.]+)!)?\$?[A-Za-z]{1,3}\$?[1-9][0-9]*/);
    if (referenceMatch) {
      tokens.push({ type: 'reference', value: referenceMatch[0] });
      index += referenceMatch[0].length;
      continue;
    }

    const numberMatch = rest.match(/^\d+(?:\.\d+)?/);
    if (numberMatch) {
      tokens.push({ type: 'number', value: numberMatch[0] });
      index += numberMatch[0].length;
      continue;
    }

    if (current === '"') {
      let value = '';
      index += 1;

      while (index < normalized.length) {
        if (normalized[index] === '"' && normalized[index + 1] === '"') {
          value += '"';
          index += 2;
          continue;
        }

        if (normalized[index] === '"') {
          index += 1;
          break;
        }

        value += normalized[index];
        index += 1;
      }

      tokens.push({ type: 'string', value });
      continue;
    }

    const operatorMatch = rest.match(/^(<>|<=|>=|=|<|>|\+|-|\*|\/|&)/);
    if (operatorMatch) {
      tokens.push({ type: 'operator', value: operatorMatch[0] });
      index += operatorMatch[0].length;
      continue;
    }

    if (current === '(' || current === ')') {
      tokens.push({ type: 'paren', value: current });
      index += 1;
      continue;
    }

    if (current === ',') {
      tokens.push({ type: 'comma', value: current });
      index += 1;
      continue;
    }

    const identifierMatch = rest.match(/^[A-Za-z_][A-Za-z0-9_.]*/);
    if (identifierMatch) {
      const value = identifierMatch[0];
      tokens.push({
        type: /^(TRUE|FALSE)$/i.test(value) ? 'boolean' : 'identifier',
        value
      });
      index += value.length;
      continue;
    }

    index += 1;
  }

  return tokens;
}

function getCellFormulaValue(cell?: Cell): FormulaScalar {
  if (!cell) {
    return undefined;
  }

  if (typeof cell.value === 'number' || typeof cell.value === 'boolean') {
    return cell.value;
  }

  return cell.value ?? undefined;
}

function toFormulaNumber(value: FormulaScalar) {
  if (value === FORMULA_ERROR) {
    return FORMULA_ERROR;
  }

  if (value === undefined || value === '') {
    return 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : FORMULA_ERROR;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : FORMULA_ERROR;
}

function stringifyFormulaValue(value: FormulaScalar) {
  if (value === FORMULA_ERROR || value === undefined) {
    return '';
  }

  return String(value);
}

function isBlankFormulaValue(value: FormulaScalar) {
  return value === undefined || value === '';
}

function compareFormulaValues(left: FormulaScalar, right: FormulaScalar, operator: string): FormulaScalar {
  if (left === FORMULA_ERROR || right === FORMULA_ERROR) {
    return false;
  }

  const equal = areFormulaValuesEqual(left, right);
  switch (operator) {
    case '=':
      return equal;
    case '<>':
      return !equal;
  }

  const comparison = compareFormulaOrder(left, right);
  switch (operator) {
    case '<':
      return comparison < 0;
    case '<=':
      return comparison <= 0;
    case '>':
      return comparison > 0;
    case '>=':
      return comparison >= 0;
    default:
      return false;
  }
}

function areFormulaValuesEqual(left: FormulaScalar, right: FormulaScalar) {
  if (isBlankFormulaValue(left) && isBlankFormulaValue(right)) {
    return true;
  }

  if (typeof left === 'number' && typeof right === 'number') {
    return left === right;
  }

  if (typeof left === 'boolean' && typeof right === 'boolean') {
    return left === right;
  }

  return stringifyFormulaValue(left).toLowerCase() === stringifyFormulaValue(right).toLowerCase();
}

function compareFormulaOrder(left: FormulaScalar, right: FormulaScalar) {
  const leftNumber = toFormulaNumber(left);
  const rightNumber = toFormulaNumber(right);
  if (leftNumber !== FORMULA_ERROR && rightNumber !== FORMULA_ERROR) {
    return leftNumber - rightNumber;
  }

  return stringifyFormulaValue(left).localeCompare(stringifyFormulaValue(right), undefined, { sensitivity: 'base' });
}
