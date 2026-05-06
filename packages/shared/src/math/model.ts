export type OfficeMathDisplayMode = 'inline' | 'block';

export interface OfficeMath {
  type: 'math';
  displayMode: OfficeMathDisplayMode;
  body: OfficeMathNode;
}

export type OfficeMathNode =
  | OfficeMathText
  | OfficeMathSequence
  | OfficeMathFraction
  | OfficeMathRadical
  | OfficeMathSuperscript
  | OfficeMathSubscript
  | OfficeMathSubSuperscript
  | OfficeMathDelimiter
  | OfficeMathFunction
  | OfficeMathNary;

export interface OfficeMathText {
  type: 'text';
  text: string;
}

export interface OfficeMathSequence {
  type: 'sequence';
  children: OfficeMathNode[];
}

export interface OfficeMathFraction {
  type: 'fraction';
  numerator: OfficeMathNode;
  denominator: OfficeMathNode;
}

export interface OfficeMathRadical {
  type: 'radical';
  degree?: OfficeMathNode;
  radicand: OfficeMathNode;
}

export interface OfficeMathSuperscript {
  type: 'superscript';
  base: OfficeMathNode;
  superscript: OfficeMathNode;
}

export interface OfficeMathSubscript {
  type: 'subscript';
  base: OfficeMathNode;
  subscript: OfficeMathNode;
}

export interface OfficeMathSubSuperscript {
  type: 'subsuperscript';
  base: OfficeMathNode;
  subscript: OfficeMathNode;
  superscript: OfficeMathNode;
}

export interface OfficeMathDelimiter {
  type: 'delimiter';
  begin?: string;
  end?: string;
  body: OfficeMathNode;
}

export interface OfficeMathFunction {
  type: 'function';
  name: OfficeMathNode;
  argument?: OfficeMathNode;
}

export interface OfficeMathNary {
  type: 'nary';
  operator: string;
  lower?: OfficeMathNode;
  upper?: OfficeMathNode;
  body?: OfficeMathNode;
}
