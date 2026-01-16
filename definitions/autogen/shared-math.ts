import {
  CT_Br,
  CT_Drawing,
  CT_Empty,
  CT_FldChar,
  CT_FtnEdnRef,
  CT_Markup,
  CT_Object,
  CT_PTab,
  CT_Picture,
  CT_RPr,
  CT_Ruby,
  CT_Sym
} from './wml';

/**
 * shared-math.xsd
 */

/** Integer value (1 to 255) */
export type ST_Integer255 = number;

/** Integer value (-2 to 2) */
export type ST_Integer2 = number;

/** Spacing Rule */
export type ST_SpacingRule = number;

/** Unsigned integer. */
export type ST_UnSignedInteger = string;

/** Character */
export type ST_Char = string;

/** On Off */
export enum ST_OnOff {
  /** On */
  on = 'on',
  /** Off */
  off = 'off'
}

/** String */
export type ST_String = string;

/** Horizontal Alignment */
export enum ST_XAlign {
  /** Left Justification */
  left = 'left',
  /** Center */
  center = 'center',
  /** Right */
  right = 'right'
}

/** Vertical Alignment */
export enum ST_YAlign {
  /** Top */
  top = 'top',
  /** Center (Function) */
  center = 'center',
  /** Bottom Alignment */
  bot = 'bot'
}

/** Shape (Delimiters) */
export enum ST_Shp {
  /** Centered (Delimiters) */
  centered = 'centered',
  /** Match */
  match = 'match'
}

/** Fraction Type */
export enum ST_FType {
  /** Bar Fraction */
  bar = 'bar',
  /** Skewed */
  skw = 'skw',
  /** Linear Fraction */
  lin = 'lin',
  /** No-Bar Fraction (Stack) */
  noBar = 'noBar'
}

/** Limit Location */
export enum ST_LimLoc {
  /** Under-Over location */
  undOvr = 'undOvr',
  /** Subscript-Superscript location */
  subSup = 'subSup'
}

/** Top-Bottom */
export enum ST_TopBot {
  /** Top */
  top = 'top',
  /** Bottom Alignment */
  bot = 'bot'
}

/** Script */
export enum ST_Script {
  /** Roman */
  roman = 'roman',
  /** Script */
  script = 'script',
  /** Fraktur */
  fraktur = 'fraktur',
  /** double-struck */
  double_struck = 'double-struck',
  /** Sans-Serif */
  sans_serif = 'sans-serif',
  /** Monospace */
  monospace = 'monospace'
}

/** Style */
export enum ST_Style {
  /** Plain */
  p = 'p',
  /** Bold */
  b = 'b',
  /** Italic */
  i = 'i',
  /** Bold-Italic */
  bi = 'bi'
}

/** Justification */
export enum ST_Jc {
  /** Left Justification */
  left = 'left',
  /** Right */
  right = 'right',
  /** Center (Equation) */
  center = 'center',
  /** Centered as Group (Equations) */
  centerGroup = 'centerGroup'
}

/** Twips measurement */
export type ST_TwipsMeasure = string;

/** Break Binary Operators */
export enum ST_BreakBin {
  /** Before */
  before = 'before',
  /** After */
  after = 'after',
  /** Repeat */
  repeat = 'repeat'
}

/** Break on Binary Subtraction */
export enum ST_BreakBinSub {
  /** Minus Minus */
  minusMinus = '--',
  /** Minus Plus */
  minusPlus = '-+',
  /** Plus Minus */
  plusMinus = '+-'
}

/** Value */
export interface CT_Integer255 {
  val: ST_Integer255;
}

/** Value */
export interface CT_Integer2 {
  val: ST_Integer2;
}

/** Value */
export interface CT_SpacingRule {
  val: ST_SpacingRule;
}

/** Value */
export interface CT_UnSignedInteger {
  val: ST_UnSignedInteger;
}

/** value */
export interface CT_Char {
  val: ST_Char;
}

/** value */
export interface CT_OnOff {
  val?: ST_OnOff;
}

/** value */
export interface CT_String {
  val?: ST_String;
}

/** Value */
export interface CT_XAlign {
  val: ST_XAlign;
}

/** Value */
export interface CT_YAlign {
  val: ST_YAlign;
}

/** Value */
export interface CT_Shp {
  val: ST_Shp;
}

/** Value */
export interface CT_FType {
  val: ST_FType;
}

/** Value */
export interface CT_LimLoc {
  val: ST_LimLoc;
}

/** Value */
export interface CT_TopBot {
  val: ST_TopBot;
}

/** Value */
export interface CT_Script {
  val?: ST_Script;
}

/** Value */
export interface CT_Style {
  val?: ST_Style;
}

/** Index of Operator to Align To */
export interface CT_ManualBreak {
  alnAt?: ST_Integer255;
}

/** Literal */
export interface CT_RPR {
  lit?: any;
  nor?: any;
  scr?: any;
  sty?: any;
  brk?: any;
  aln?: any;
}

/** Content Contains Significant Whitespace */
export interface CT_Text {
  val?: ST_String;
  space?: any;
}

/** Run Properties */
export interface CT_R {
  rPr?: CT_RPR | CT_RPr;
  br?: CT_Br;
  t?: CT_Text;
  delText?: CT_Text;
  instrText?: CT_Text;
  delInstrText?: CT_Text;
  noBreakHyphen?: CT_Empty;
  softHyphen?: CT_Empty;
  dayShort?: CT_Empty;
  monthShort?: CT_Empty;
  yearShort?: CT_Empty;
  dayLong?: CT_Empty;
  monthLong?: CT_Empty;
  yearLong?: CT_Empty;
  annotationRef?: CT_Empty;
  footnoteRef?: CT_Empty;
  endnoteRef?: CT_Empty;
  separator?: CT_Empty;
  continuationSeparator?: CT_Empty;
  sym?: CT_Sym;
  pgNum?: CT_Empty;
  cr?: CT_Empty;
  tab?: CT_Empty;
  object?: CT_Object;
  pict?: CT_Picture;
  fldChar?: CT_FldChar;
  ruby?: CT_Ruby;
  footnoteReference?: CT_FtnEdnRef;
  endnoteReference?: CT_FtnEdnRef;
  commentReference?: CT_Markup;
  drawing?: CT_Drawing;
  ptab?: CT_PTab;
  lastRenderedPageBreak?: CT_Empty;
}

export interface CT_CtrlPr {}

/** Accent Character */
export interface CT_AccPr {
  chr?: CT_Char;
  ctrlPr?: CT_CtrlPr;
}

/** Accent Properties */
export interface CT_Acc {
  accPr?: CT_AccPr;
  e: CT_OMathArg;
}

/** Position (Bar) */
export interface CT_BarPr {
  pos?: CT_TopBot;
  ctrlPr?: CT_CtrlPr;
}

/** Bar Properties */
export interface CT_Bar {
  barPr?: CT_BarPr;
  e: CT_OMathArg;
}

/** Operator Emulator */
export interface CT_BoxPr {
  opEmu?: CT_OnOff;
  noBreak?: CT_OnOff;
  diff?: CT_OnOff;
  brk?: CT_ManualBreak;
  aln?: CT_OnOff;
  ctrlPr?: CT_CtrlPr;
}

/** Box Properties */
export interface CT_Box {
  boxPr?: CT_BoxPr;
  e: CT_OMathArg;
}

/** Hide Top Edge */
export interface CT_BorderBoxPr {
  hideTop?: CT_OnOff;
  hideBot?: CT_OnOff;
  hideLeft?: CT_OnOff;
  hideRight?: CT_OnOff;
  strikeH?: CT_OnOff;
  strikeV?: CT_OnOff;
  strikeBLTR?: CT_OnOff;
  strikeTLBR?: CT_OnOff;
  ctrlPr?: CT_CtrlPr;
}

/** Border Box Properties */
export interface CT_BorderBox {
  borderBoxPr?: CT_BorderBoxPr;
  e: CT_OMathArg;
}

/** Delimiter Beginning Character */
export interface CT_DPr {
  begChr?: CT_Char;
  sepChr?: CT_Char;
  endChr?: CT_Char;
  grow?: CT_OnOff;
  shp?: CT_Shp;
  ctrlPr?: CT_CtrlPr;
}

/** Delimiter Properties */
export interface CT_D {
  dPr?: CT_DPr;
  e: CT_OMathArg[];
}

/** Equation Array Base Justification */
export interface CT_EqArrPr {
  baseJc?: CT_YAlign;
  maxDist?: CT_OnOff;
  objDist?: CT_OnOff;
  rSpRule?: CT_SpacingRule;
  rSp?: CT_UnSignedInteger;
  ctrlPr?: CT_CtrlPr;
}

/** Equation Array Properties */
export interface CT_EqArr {
  eqArrPr?: CT_EqArrPr;
  e: CT_OMathArg[];
}

/** Fraction type */
export interface CT_FPr {
  type?: CT_FType;
  ctrlPr?: CT_CtrlPr;
}

/** Fraction Properties */
export interface CT_F {
  fPr?: CT_FPr;
  num: CT_OMathArg;
  den: CT_OMathArg;
}

export interface CT_FuncPr {
  ctrlPr?: CT_CtrlPr;
}

/** Function Properties */
export interface CT_Func {
  funcPr?: CT_FuncPr;
  fName: CT_OMathArg;
  e: CT_OMathArg;
}

/** Group Character (Grouping Character) */
export interface CT_GroupChrPr {
  chr?: CT_Char;
  pos?: CT_TopBot;
  vertJc?: CT_TopBot;
  ctrlPr?: CT_CtrlPr;
}

/** Group-Character Properties */
export interface CT_GroupChr {
  groupChrPr?: CT_GroupChrPr;
  e: CT_OMathArg;
}

export interface CT_LimLowPr {
  ctrlPr?: CT_CtrlPr;
}

/** Lower Limit Properties */
export interface CT_LimLow {
  limLowPr?: CT_LimLowPr;
  e: CT_OMathArg;
  lim: CT_OMathArg;
}

export interface CT_LimUppPr {
  ctrlPr?: CT_CtrlPr;
}

/** Upper Limit Properties */
export interface CT_LimUpp {
  limUppPr?: CT_LimUppPr;
  e: CT_OMathArg;
  lim: CT_OMathArg;
}

/** Matrix Column Count */
export interface CT_MCPr {
  count?: CT_Integer255;
  mcJc?: CT_XAlign;
}

/** Matrix Column Properties */
export interface CT_MC {
  mcPr?: CT_MCPr;
}

/** Matrix Column */
export interface CT_MCS {
  mc: CT_MC[];
}

/** Matrix Base Justification */
export interface CT_MPr {
  baseJc?: CT_YAlign;
  plcHide?: CT_OnOff;
  rSpRule?: CT_SpacingRule;
  cGpRule?: CT_SpacingRule;
  rSp?: CT_UnSignedInteger;
  cSp?: CT_UnSignedInteger;
  cGp?: CT_UnSignedInteger;
  mcs?: CT_MCS;
  ctrlPr?: CT_CtrlPr;
}

/** Element */
export interface CT_MR {
  e: CT_OMathArg[];
}

/** Matrix Properties */
export interface CT_M {
  mPr?: CT_MPr;
  mr: CT_MR[];
}

/** n-ary Operator Character */
export interface CT_NaryPr {
  chr?: CT_Char;
  limLoc?: CT_LimLoc;
  grow?: CT_OnOff;
  subHide?: CT_OnOff;
  supHide?: CT_OnOff;
  ctrlPr?: CT_CtrlPr;
}

/** n-ary Properties */
export interface CT_Nary {
  naryPr?: CT_NaryPr;
  sub: CT_OMathArg;
  sup: CT_OMathArg;
  e: CT_OMathArg;
}

/** Phantom Show */
export interface CT_PhantPr {
  show?: CT_OnOff;
  zeroWid?: CT_OnOff;
  zeroAsc?: CT_OnOff;
  zeroDesc?: CT_OnOff;
  transp?: CT_OnOff;
  ctrlPr?: CT_CtrlPr;
}

/** Phantom Properties */
export interface CT_Phant {
  phantPr?: CT_PhantPr;
  e: CT_OMathArg;
}

/** Hide Degree */
export interface CT_RadPr {
  degHide?: CT_OnOff;
  ctrlPr?: CT_CtrlPr;
}

/** Radical Properties */
export interface CT_Rad {
  radPr?: CT_RadPr;
  deg: CT_OMathArg;
  e: CT_OMathArg;
}

export interface CT_SPrePr {
  ctrlPr?: CT_CtrlPr;
}

/** Pre-Sub-Superscript Properties */
export interface CT_SPre {
  sPrePr?: CT_SPrePr;
  sub: CT_OMathArg;
  sup: CT_OMathArg;
  e: CT_OMathArg;
}

export interface CT_SSubPr {
  ctrlPr?: CT_CtrlPr;
}

/** Subscript Properties */
export interface CT_SSub {
  sSubPr?: CT_SSubPr;
  e: CT_OMathArg;
  sub: CT_OMathArg;
}

/** Align Scripts */
export interface CT_SSubSupPr {
  alnScr?: CT_OnOff;
  ctrlPr?: CT_CtrlPr;
}

/** Sub-Superscript Properties */
export interface CT_SSubSup {
  sSubSupPr?: CT_SSubSupPr;
  e: CT_OMathArg;
  sub: CT_OMathArg;
  sup: CT_OMathArg;
}

export interface CT_SSupPr {
  ctrlPr?: CT_CtrlPr;
}

/** Superscript Properties */
export interface CT_SSup {
  sSupPr?: CT_SSupPr;
  e: CT_OMathArg;
  sup: CT_OMathArg;
}

/** Argument Size */
export interface CT_OMathArgPr {
  argSz?: CT_Integer2;
}

/** Argument Properties */
export interface CT_OMathArg {
  argPr?: CT_OMathArgPr;
  ctrlPr?: CT_CtrlPr;
}

/** Value */
export interface CT_OMathJc {
  val?: ST_Jc;
}

/** Justification */
export interface CT_OMathParaPr {
  jc?: CT_OMathJc;
}

/** Value */
export interface CT_TwipsMeasure {
  val: ST_TwipsMeasure;
}

/** Value */
export interface CT_BreakBin {
  val?: ST_BreakBin;
}

/** Value */
export interface CT_BreakBinSub {
  val?: ST_BreakBinSub;
}

/** Math Font */
export interface CT_MathPr {
  mathFont?: CT_String;
  brkBin?: CT_BreakBin;
  brkBinSub?: CT_BreakBinSub;
  smallFrac?: CT_OnOff;
  dispDef?: CT_OnOff;
  lMargin?: CT_TwipsMeasure;
  rMargin?: CT_TwipsMeasure;
  defJc?: CT_OMathJc;
  preSp?: CT_TwipsMeasure;
  postSp?: CT_TwipsMeasure;
  interSp?: CT_TwipsMeasure;
  intraSp?: CT_TwipsMeasure;
  wrapIndent: CT_TwipsMeasure;
  wrapRight: CT_OnOff;
  intLim?: CT_LimLoc;
  naryLim?: CT_LimLoc;
}

/** Office Math Paragraph Properties */
export interface CT_OMathPara {
  oMathParaPr?: CT_OMathParaPr;
  oMath: CT_OMath[];
}

export interface CT_OMath {}
