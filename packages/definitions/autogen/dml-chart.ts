import { CT_Extension, CT_ExtensionList, ST_TextLanguageID, ST_Xstring } from './common-types';
import { CT_ShapeProperties } from './dml-shapeProperties';
import { CT_ColorMapping } from './dml-stylesheet';
import { CT_TextBody } from './dml-text';

/**
 * dml-chart.xsd
 */

/** String With Encoded Characters */

/** Chart Language Tag */

/** Layout Target */
export enum ST_LayoutTarget {
  /** Inner */
  inner = 'inner',
  /** Outer */
  outer = 'outer'
}

/** Layout Mode */
export enum ST_LayoutMode {
  /** Edge */
  edge = 'edge',
  /** Factor */
  factor = 'factor'
}

/** X Rotation */
export type ST_RotX = number;

/** Height Percent */
export type ST_HPercent = number;

/** Y Rotation */
export type ST_RotY = number;

/** Depth Percent */
export type ST_DepthPercent = number;

/** Perspective */
export type ST_Perspective = number;

/** Gap Amount */
export type ST_GapAmount = number;

/** Overlap */
export type ST_Overlap = number;

/** Bubble Scale */
export type ST_BubbleScale = number;

/** Size Represents */
export enum ST_SizeRepresents {
  /** Bubble Size Represents Area */
  area = 'area',
  /** Bubble Size Represents Width */
  w = 'w'
}

/** First Slice Angle */
export type ST_FirstSliceAng = number;

/** Hole Size */
export type ST_HoleSize = number;

/** Split Type */
export enum ST_SplitType {
  /** Default Split */
  auto = 'auto',
  /** Custom Split */
  cust = 'cust',
  /** Split by Percentage */
  percent = 'percent',
  /** Split by Position */
  pos = 'pos',
  /** Split by Value */
  val = 'val'
}

/** Second Pie Size */
export type ST_SecondPieSize = number;

/** Label Alignment */
export enum ST_LblAlgn {
  /** Center */
  ctr = 'ctr',
  /** Left */
  l = 'l',
  /** Right */
  r = 'r'
}

/** Data Label Position */
export enum ST_DLblPos {
  /** Best Fit */
  bestFit = 'bestFit',
  /** Bottom */
  b = 'b',
  /** Center */
  ctr = 'ctr',
  /** Inside Base */
  inBase = 'inBase',
  /** Inside End */
  inEnd = 'inEnd',
  /** Left */
  l = 'l',
  /** Outside End */
  outEnd = 'outEnd',
  /** Right */
  r = 'r',
  /** Top */
  t = 't'
}

/** Marker Style */
export enum ST_MarkerStyle {
  /** Circle */
  circle = 'circle',
  /** Dash */
  dash = 'dash',
  /** Diamond */
  diamond = 'diamond',
  /** Dot */
  dot = 'dot',
  /** None */
  none = 'none',
  /** Picture */
  picture = 'picture',
  /** Plus */
  plus = 'plus',
  /** Square */
  square = 'square',
  /** Star */
  star = 'star',
  /** Triangle */
  triangle = 'triangle',
  /** X */
  x = 'x'
}

/** Marker Size */
export type ST_MarkerSize = number;

/** Trendline Type */
export enum ST_TrendlineType {
  /** Exponential */
  exp = 'exp',
  /** Linear */
  linear = 'linear',
  /** Logarithmic */
  log = 'log',
  /** Moving Average */
  movingAvg = 'movingAvg',
  /** Polynomial */
  poly = 'poly',
  /** Power */
  power = 'power'
}

/** Order */
export type ST_Order = number;

/** Period */
export type ST_Period = number;

/** Error Bar Direction */
export enum ST_ErrDir {
  /** X */
  x = 'x',
  /** Y */
  y = 'y'
}

/** Error Bar Type */
export enum ST_ErrBarType {
  /** Both */
  both = 'both',
  /** Minus */
  minus = 'minus',
  /** Plus */
  plus = 'plus'
}

/** Error Value Type */
export enum ST_ErrValType {
  /** Custom Error Bars */
  cust = 'cust',
  /** Fixed Value */
  fixedVal = 'fixedVal',
  /** Percentage */
  percentage = 'percentage',
  /** Standard Deviation */
  stdDev = 'stdDev',
  /** Standard Error */
  stdErr = 'stdErr'
}

/** Grouping */
export enum ST_Grouping {
  /** 100% Stacked */
  percentStacked = 'percentStacked',
  /** Standard */
  standard = 'standard',
  /** Stacked */
  stacked = 'stacked'
}

/** Scatter Style */
export enum ST_ScatterStyle {
  /** None */
  none = 'none',
  /** Line */
  line = 'line',
  /** Line with Markers */
  lineMarker = 'lineMarker',
  /** Marker */
  marker = 'marker',
  /** Smooth */
  smooth = 'smooth',
  /** Smooth with Markers */
  smoothMarker = 'smoothMarker'
}

/** Radar Style */
export enum ST_RadarStyle {
  /** Standard */
  standard = 'standard',
  /** Marker */
  marker = 'marker',
  /** Filled */
  filled = 'filled'
}

/** Bar Grouping */
export enum ST_BarGrouping {
  /** 100% Stacked */
  percentStacked = 'percentStacked',
  /** Clustered */
  clustered = 'clustered',
  /** Standard */
  standard = 'standard',
  /** Stacked */
  stacked = 'stacked'
}

/** Bar Direction */
export enum ST_BarDir {
  /** Bar */
  bar = 'bar',
  /** Column */
  col = 'col'
}

/** Shape */
export enum ST_Shape {
  /** Cone */
  cone = 'cone',
  /** Cone to Max */
  coneToMax = 'coneToMax',
  /** Box */
  box = 'box',
  /** Cylinder */
  cylinder = 'cylinder',
  /** Pyramid */
  pyramid = 'pyramid',
  /** Pyramid to Maximum */
  pyramidToMax = 'pyramidToMax'
}

/** Pie of Pie or Bar of Pie Type */
export enum ST_OfPieType {
  /** Pie */
  pie = 'pie',
  /** Bar */
  bar = 'bar'
}

/** Axis Position */
export enum ST_AxPos {
  /** Bottom */
  b = 'b',
  /** Left */
  l = 'l',
  /** Right */
  r = 'r',
  /** Top */
  t = 't'
}

/** Crosses */
export enum ST_Crosses {
  /** Axis Crosses at Zero */
  autoZero = 'autoZero',
  /** Maximum */
  max = 'max',
  /** Minimum */
  min = 'min'
}

/** Cross Between */
export enum ST_CrossBetween {
  /** Between */
  between = 'between',
  /** Midpoint of Category */
  midCat = 'midCat'
}

/** Tick Mark */
export enum ST_TickMark {
  /** Cross */
  cross = 'cross',
  /** Inside */
  in = 'in',
  /** None */
  none = 'none',
  /** Outside */
  out = 'out'
}

/** Tick Label Position */
export enum ST_TickLblPos {
  /** High */
  high = 'high',
  /** Low */
  low = 'low',
  /** Next To */
  nextTo = 'nextTo',
  /** None */
  none = 'none'
}

/** Skip */
export type ST_Skip = number;

/** Time Unit */
export enum ST_TimeUnit {
  /** Days */
  days = 'days',
  /** Months */
  months = 'months',
  /** Years */
  years = 'years'
}

/** Axis Unit */
export type ST_AxisUnit = number;

/** Built-In Unit */
export enum ST_BuiltInUnit {
  /** Hundreds */
  hundreds = 'hundreds',
  /** Thousands */
  thousands = 'thousands',
  /** Ten Thousands */
  tenThousands = 'tenThousands',
  /** Hundred Thousands */
  hundredThousands = 'hundredThousands',
  /** Millions */
  millions = 'millions',
  /** Ten Millions */
  tenMillions = 'tenMillions',
  /** Hundred Millions */
  hundredMillions = 'hundredMillions',
  /** Billions */
  billions = 'billions',
  /** Trillions */
  trillions = 'trillions'
}

/** Picture Format */
export enum ST_PictureFormat {
  /** Stretch */
  stretch = 'stretch',
  /** Stack */
  stack = 'stack',
  /** Stack and Scale */
  stackScale = 'stackScale'
}

/** Picture Stack Unit */
export type ST_PictureStackUnit = number;

/** Orientation */
export enum ST_Orientation {
  /** Maximum to Minimum */
  maxMin = 'maxMin',
  /** Minimum to Maximum */
  minMax = 'minMax'
}

/** Logarithmic Base */
export type ST_LogBase = number;

/** Label Offset */
export type ST_LblOffset = number;

/** Legend Position */
export enum ST_LegendPos {
  /** Bottom */
  b = 'b',
  /** Top Right */
  tr = 'tr',
  /** Left */
  l = 'l',
  /** Right */
  r = 'r',
  /** Top */
  t = 't'
}

/** Display Blanks As */
export enum ST_DispBlanksAs {
  /** Span */
  span = 'span',
  /** Gap */
  gap = 'gap',
  /** Zero */
  zero = 'zero'
}

/** Style */
export type ST_Style = number;

/** Printed Page Orientation */
export enum ST_PageSetupOrientation {
  /** Default Page Orientation */
  default = 'default',
  /** Portrait Page */
  portrait = 'portrait',
  /** Landscape Page */
  landscape = 'landscape'
}

/** Boolean Value */
export interface CT_Boolean {
  val?: boolean;
}

/** Floating Point Value */
export interface CT_Double {
  val: number;
}

/** Integer Value */
export interface CT_UnsignedInt {
  val: number;
}

/** Relationship Reference */
export interface CT_RelId {
  id: string;
}

/** Uniform Resource Identifier */

/** Extension */

/** Numeric Value */
export interface CT_NumVal {
  idx: number;
  formatCode?: ST_Xstring;
  v: ST_Xstring;
}

/** Format Code */
export interface CT_NumData {
  formatCode?: ST_Xstring;
  ptCount?: CT_UnsignedInt;
  pt?: CT_NumVal[];
  extLst?: CT_ExtensionList;
}

/** Formula */
export interface CT_NumRef {
  f: string;
  numCache?: CT_NumData;
  extLst?: CT_ExtensionList;
}

/** Number Reference */
export interface CT_NumDataSource {
  numRef: CT_NumRef;
  numLit: CT_NumData;
}

/** Text Value */
export interface CT_StrVal {
  idx: number;
  v: ST_Xstring;
}

export interface CT_StrData {
  ptCount?: CT_UnsignedInt;
  pt?: CT_StrVal[];
  extLst?: CT_ExtensionList;
}

/** Formula */
export interface CT_StrRef {
  f: string;
  strCache?: CT_StrData;
  extLst?: CT_ExtensionList;
}

/** String Reference */
export interface CT_Tx {
  strRef: CT_StrRef;
  rich: CT_TextBody;
}

/** Language Code */
export interface CT_TextLanguageID {
  val: ST_TextLanguageID;
}

/** String Point */
export interface CT_Lvl {
  pt?: CT_StrVal[];
}

/** Level */
export interface CT_MultiLvlStrData {
  ptCount?: CT_UnsignedInt;
  lvl?: CT_Lvl[];
  extLst?: CT_ExtensionList;
}

/** Formula */
export interface CT_MultiLvlStrRef {
  f: string;
  multiLvlStrCache?: CT_MultiLvlStrData;
  extLst?: CT_ExtensionList;
}

/** Multi Level String Reference */
export interface CT_AxDataSource {
  multiLvlStrRef: CT_MultiLvlStrRef;
  numRef: CT_NumRef;
  numLit: CT_NumData;
  strRef: CT_StrRef;
  strLit: CT_StrData;
}

export interface CT_SerTx {
  strRef: CT_StrRef;
  v: ST_Xstring;
}

/** Layout Target Value */
export interface CT_LayoutTarget {
  val?: ST_LayoutTarget;
}

/** Layout Mode Value */
export interface CT_LayoutMode {
  val?: ST_LayoutMode;
}

/** Layout Target */
export interface CT_ManualLayout {
  layoutTarget?: CT_LayoutTarget;
  xMode?: CT_LayoutMode;
  yMode?: CT_LayoutMode;
  wMode?: CT_LayoutMode;
  hMode?: CT_LayoutMode;
  x?: CT_Double;
  y?: CT_Double;
  w?: CT_Double;
  h?: CT_Double;
  extLst?: CT_ExtensionList;
}

/** Manual Layout */
export interface CT_Layout {
  manualLayout?: CT_ManualLayout;
  extLst?: CT_ExtensionList;
}

/** Chart Text */
export interface CT_Title {
  tx?: CT_Tx;
  layout?: CT_Layout;
  overlay?: CT_Boolean;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  extLst?: CT_ExtensionList;
}

/** X Rotation Value */
export interface CT_RotX {
  val?: ST_RotX;
}

/** Height Percent Value */
export interface CT_HPercent {
  val?: ST_HPercent;
}

/** Y Rotation Value */
export interface CT_RotY {
  val?: ST_RotY;
}

/** Depth Percent Value */
export interface CT_DepthPercent {
  val?: ST_DepthPercent;
}

/** Perspective Value */
export interface CT_Perspective {
  val?: ST_Perspective;
}

/** X Rotation */
export interface CT_View3D {
  rotX?: CT_RotX;
  hPercent?: CT_HPercent;
  rotY?: CT_RotY;
  depthPercent?: CT_DepthPercent;
  rAngAx?: CT_Boolean;
  perspective?: CT_Perspective;
  extLst?: CT_ExtensionList;
}

/** Thickness */
export interface CT_Surface {
  thickness?: CT_UnsignedInt;
  spPr?: CT_ShapeProperties;
  pictureOptions?: CT_PictureOptions;
  extLst?: CT_ExtensionList;
}

/** Show Horizontal Border */
export interface CT_DTable {
  showHorzBorder?: CT_Boolean;
  showVertBorder?: CT_Boolean;
  showOutline?: CT_Boolean;
  showKeys?: CT_Boolean;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  extLst?: CT_ExtensionList;
}

/** Gap Size Value */
export interface CT_GapAmount {
  val?: ST_GapAmount;
}

/** Overlap Value */
export interface CT_Overlap {
  val?: ST_Overlap;
}

/** Bubble Scale Value */
export interface CT_BubbleScale {
  val?: ST_BubbleScale;
}

/** Size Represents Value */
export interface CT_SizeRepresents {
  val?: ST_SizeRepresents;
}

/** First Slice Angle Value */
export interface CT_FirstSliceAng {
  val?: ST_FirstSliceAng;
}

/** Hole Size Value */
export interface CT_HoleSize {
  val?: ST_HoleSize;
}

/** Split Type Value */
export interface CT_SplitType {
  val?: ST_SplitType;
}

/** Second Pie Point */
export interface CT_CustSplit {
  secondPiePt?: CT_UnsignedInt[];
}

/** Second Pie Size Value */
export interface CT_SecondPieSize {
  val?: ST_SecondPieSize;
}

/** Number Format Code */
export interface CT_NumFmt {
  formatCode: ST_Xstring;
  sourceLinked?: boolean;
}

/** Label Alignment Value */
export interface CT_LblAlgn {
  val: ST_LblAlgn;
}

/** Data Label Position Value */
export interface CT_DLblPos {
  val: ST_DLblPos;
}

/** Index */
export interface CT_DLbl {
  idx: CT_UnsignedInt;
  delete?: CT_Boolean;
  extLst?: CT_ExtensionList;
}

/** Data Label */
export interface CT_DLbls {
  dLbl?: CT_DLbl[];
  delete?: CT_Boolean;
  extLst?: CT_ExtensionList;
}

/** Marker Style Value */
export interface CT_MarkerStyle {
  val: ST_MarkerStyle;
}

/** Marker Size Value */
export interface CT_MarkerSize {
  val?: ST_MarkerSize;
}

/** Symbol */
export interface CT_Marker {
  symbol?: CT_MarkerStyle;
  size?: CT_MarkerSize;
  spPr?: CT_ShapeProperties;
  extLst?: CT_ExtensionList;
}

/** Index */
export interface CT_DPt {
  idx: CT_UnsignedInt;
  invertIfNegative?: CT_Boolean;
  marker?: CT_Marker;
  bubble3D?: CT_Boolean;
  explosion?: CT_UnsignedInt;
  spPr?: CT_ShapeProperties;
  pictureOptions?: CT_PictureOptions;
  extLst?: CT_ExtensionList;
}

/** Trendline Type Value */
export interface CT_TrendlineType {
  val?: ST_TrendlineType;
}

/** Order Value */
export interface CT_Order {
  val?: ST_Order;
}

/** Period Value */
export interface CT_Period {
  val?: ST_Period;
}

/** Layout */
export interface CT_TrendlineLbl {
  layout?: CT_Layout;
  tx?: CT_Tx;
  numFmt?: CT_NumFmt;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  extLst?: CT_ExtensionList;
}

/** Trendline Name */
export interface CT_Trendline {
  name?: string;
  spPr?: CT_ShapeProperties;
  trendlineType: CT_TrendlineType;
  order?: CT_Order;
  period?: CT_Period;
  forward?: CT_Double;
  backward?: CT_Double;
  intercept?: CT_Double;
  dispRSqr?: CT_Boolean;
  dispEq?: CT_Boolean;
  trendlineLbl?: CT_TrendlineLbl;
  extLst?: CT_ExtensionList;
}

/** Error Bar Direction Value */
export interface CT_ErrDir {
  val: ST_ErrDir;
}

/** Error Bar Type Value */
export interface CT_ErrBarType {
  val?: ST_ErrBarType;
}

/** Error Bar Type Value */
export interface CT_ErrValType {
  val?: ST_ErrValType;
}

/** Error Bar Direction */
export interface CT_ErrBars {
  errDir?: CT_ErrDir;
  errBarType: CT_ErrBarType;
  errValType: CT_ErrValType;
  noEndCap?: CT_Boolean;
  plus?: CT_NumDataSource;
  minus?: CT_NumDataSource;
  val?: CT_Double;
  spPr?: CT_ShapeProperties;
  extLst?: CT_ExtensionList;
}

export interface CT_UpDownBar {
  spPr?: CT_ShapeProperties;
}

/** Gap Width */
export interface CT_UpDownBars {
  gapWidth?: CT_GapAmount;
  upBars?: CT_UpDownBar;
  downBars?: CT_UpDownBar;
  extLst?: CT_ExtensionList;
}

/** Marker */
export interface CT_LineSer {
  idx: CT_UnsignedInt;
  order: CT_UnsignedInt;
  tx?: CT_SerTx;
  spPr?: CT_ShapeProperties;
  marker?: CT_Marker;
  dPt?: CT_DPt[];
  dLbls?: CT_DLbls;
  trendline?: CT_Trendline[];
  errBars?: CT_ErrBars;
  cat?: CT_AxDataSource;
  val?: CT_NumDataSource;
  smooth?: CT_Boolean;
  extLst?: CT_ExtensionList;
}

/** Marker */
export interface CT_ScatterSer {
  idx: CT_UnsignedInt;
  order: CT_UnsignedInt;
  tx?: CT_SerTx;
  spPr?: CT_ShapeProperties;
  marker?: CT_Marker;
  dPt?: CT_DPt[];
  dLbls?: CT_DLbls;
  trendline?: CT_Trendline[];
  errBars?: CT_ErrBars[];
  xVal?: CT_AxDataSource;
  yVal?: CT_NumDataSource;
  smooth?: CT_Boolean;
  extLst?: CT_ExtensionList;
}

/** Marker */
export interface CT_RadarSer {
  idx: CT_UnsignedInt;
  order: CT_UnsignedInt;
  tx?: CT_SerTx;
  spPr?: CT_ShapeProperties;
  marker?: CT_Marker;
  dPt?: CT_DPt[];
  dLbls?: CT_DLbls;
  cat?: CT_AxDataSource;
  val?: CT_NumDataSource;
  extLst?: CT_ExtensionList;
}

/** Invert if Negative */
export interface CT_BarSer {
  idx: CT_UnsignedInt;
  order: CT_UnsignedInt;
  tx?: CT_SerTx;
  spPr?: CT_ShapeProperties;
  invertIfNegative?: CT_Boolean;
  pictureOptions?: CT_PictureOptions;
  dPt?: CT_DPt[];
  dLbls?: CT_DLbls;
  trendline?: CT_Trendline[];
  errBars?: CT_ErrBars;
  cat?: CT_AxDataSource;
  val?: CT_NumDataSource;
  shape?: CT_Shape;
  extLst?: CT_ExtensionList;
}

/** Data Point */
export interface CT_AreaSer {
  idx: CT_UnsignedInt;
  order: CT_UnsignedInt;
  tx?: CT_SerTx;
  spPr?: CT_ShapeProperties;
  pictureOptions?: CT_PictureOptions;
  dPt?: CT_DPt[];
  dLbls?: CT_DLbls;
  trendline?: CT_Trendline[];
  errBars?: CT_ErrBars[];
  cat?: CT_AxDataSource;
  val?: CT_NumDataSource;
  extLst?: CT_ExtensionList;
}

/** Explosion */
export interface CT_PieSer {
  idx: CT_UnsignedInt;
  order: CT_UnsignedInt;
  tx?: CT_SerTx;
  spPr?: CT_ShapeProperties;
  explosion?: CT_UnsignedInt;
  dPt?: CT_DPt[];
  dLbls?: CT_DLbls;
  cat?: CT_AxDataSource;
  val?: CT_NumDataSource;
  extLst?: CT_ExtensionList;
}

/** Invert if Negative */
export interface CT_BubbleSer {
  idx: CT_UnsignedInt;
  order: CT_UnsignedInt;
  tx?: CT_SerTx;
  spPr?: CT_ShapeProperties;
  invertIfNegative?: CT_Boolean;
  dPt?: CT_DPt[];
  dLbls?: CT_DLbls;
  trendline?: CT_Trendline[];
  errBars?: CT_ErrBars[];
  xVal?: CT_AxDataSource;
  yVal?: CT_NumDataSource;
  bubbleSize?: CT_NumDataSource;
  bubble3D?: CT_Boolean;
  extLst?: CT_ExtensionList;
}

/** Category Axis Data */
export interface CT_SurfaceSer {
  idx: CT_UnsignedInt;
  order: CT_UnsignedInt;
  tx?: CT_SerTx;
  spPr?: CT_ShapeProperties;
  cat?: CT_AxDataSource;
  val?: CT_NumDataSource;
  extLst?: CT_ExtensionList;
}

/** Grouping Value */
export interface CT_Grouping {
  val?: ST_Grouping;
}

export interface CT_ChartLines {
  spPr?: CT_ShapeProperties;
}

/** High Low Lines */
export interface CT_LineChart {
  grouping: CT_Grouping;
  varyColors?: CT_Boolean;
  ser?: CT_LineSer[];
  dLbls?: CT_DLbls;
  dropLines?: CT_ChartLines;
  hiLowLines?: CT_ChartLines;
  upDownBars?: CT_UpDownBars;
  marker?: CT_Boolean;
  smooth?: CT_Boolean;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

/** Gap Depth */
export interface CT_Line3DChart {
  grouping: CT_Grouping;
  varyColors?: CT_Boolean;
  ser?: CT_LineSer[];
  dLbls?: CT_DLbls;
  dropLines?: CT_ChartLines;
  gapDepth?: CT_GapAmount;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

/** Line Chart Series */
export interface CT_StockChart {
  ser: CT_LineSer[];
  dLbls?: CT_DLbls;
  dropLines?: CT_ChartLines;
  hiLowLines?: CT_ChartLines;
  upDownBars?: CT_UpDownBars;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

/** Scatter Style Value */
export interface CT_ScatterStyle {
  val?: ST_ScatterStyle;
}

/** Scatter Style */
export interface CT_ScatterChart {
  scatterStyle: CT_ScatterStyle;
  varyColors?: CT_Boolean;
  ser?: CT_ScatterSer[];
  dLbls?: CT_DLbls;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

/** Radar Style Value */
export interface CT_RadarStyle {
  val?: ST_RadarStyle;
}

/** Radar Style */
export interface CT_RadarChart {
  radarStyle: CT_RadarStyle;
  varyColors?: CT_Boolean;
  ser?: CT_RadarSer[];
  dLbls?: CT_DLbls;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

/** Bar Grouping Value */
export interface CT_BarGrouping {
  val?: ST_BarGrouping;
}

/** Bar Direction Value */
export interface CT_BarDir {
  val?: ST_BarDir;
}

/** Shape Value */
export interface CT_Shape {
  val?: ST_Shape;
}

/** Gap Width */
export interface CT_BarChart {
  barDir: CT_BarDir;
  grouping?: CT_BarGrouping;
  varyColors?: CT_Boolean;
  ser?: CT_BarSer[];
  dLbls?: CT_DLbls;
  gapWidth?: CT_GapAmount;
  overlap?: CT_Overlap;
  serLines?: CT_ChartLines[];
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

/** Gap Width */
export interface CT_Bar3DChart {
  barDir: CT_BarDir;
  grouping?: CT_BarGrouping;
  varyColors?: CT_Boolean;
  ser?: CT_BarSer[];
  dLbls?: CT_DLbls;
  gapWidth?: CT_GapAmount;
  gapDepth?: CT_GapAmount;
  shape?: CT_Shape;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

/** Axis ID */
export interface CT_AreaChart {
  grouping?: CT_Grouping;
  varyColors?: CT_Boolean;
  ser?: CT_AreaSer[];
  dLbls?: CT_DLbls;
  dropLines?: CT_ChartLines;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

/** Gap Depth */
export interface CT_Area3DChart {
  grouping?: CT_Grouping;
  varyColors?: CT_Boolean;
  ser?: CT_AreaSer[];
  dLbls?: CT_DLbls;
  dropLines?: CT_ChartLines;
  gapDepth?: CT_GapAmount;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

/** First Slice Angle */
export interface CT_PieChart {
  varyColors?: CT_Boolean;
  ser?: CT_PieSer[];
  dLbls?: CT_DLbls;
  firstSliceAng?: CT_FirstSliceAng;
  extLst?: CT_ExtensionList;
}

/** Chart Extensibility */
export interface CT_Pie3DChart {
  varyColors?: CT_Boolean;
  ser?: CT_PieSer[];
  dLbls?: CT_DLbls;
  extLst?: CT_ExtensionList;
}

/** First Slice Angle */
export interface CT_DoughnutChart {
  varyColors?: CT_Boolean;
  ser?: CT_PieSer[];
  dLbls?: CT_DLbls;
  firstSliceAng?: CT_FirstSliceAng;
  holeSize?: CT_HoleSize;
  extLst?: CT_ExtensionList;
}

/** Pie of Pie or Bar of Pie Type Value */
export interface CT_OfPieType {
  val?: ST_OfPieType;
}

/** Pie of Pie or Bar of Pie Type */
export interface CT_OfPieChart {
  ofPieType: CT_OfPieType;
  varyColors?: CT_Boolean;
  ser?: CT_PieSer[];
  dLbls?: CT_DLbls;
  gapWidth?: CT_GapAmount;
  splitType?: CT_SplitType;
  splitPos?: CT_Double;
  custSplit?: CT_CustSplit;
  secondPieSize?: CT_SecondPieSize;
  serLines?: CT_ChartLines[];
  extLst?: CT_ExtensionList;
}

/** Bubble Chart Series */
export interface CT_BubbleChart {
  varyColors?: CT_Boolean;
  ser?: CT_BubbleSer[];
  dLbls?: CT_DLbls;
  bubble3D?: CT_Boolean;
  bubbleScale?: CT_BubbleScale;
  showNegBubbles?: CT_Boolean;
  sizeRepresents?: CT_SizeRepresents;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

export interface CT_BandFmt {
  idx: CT_UnsignedInt;
  spPr?: CT_ShapeProperties;
}

/** Band Format */
export interface CT_BandFmts {
  bandFmt?: CT_BandFmt[];
}

/** Axis ID */
export interface CT_SurfaceChart {
  wireframe?: CT_Boolean;
  ser?: CT_SurfaceSer[];
  bandFmts?: CT_BandFmts;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

/** Axis ID */
export interface CT_Surface3DChart {
  wireframe?: CT_Boolean;
  ser?: CT_SurfaceSer[];
  bandFmts?: CT_BandFmts;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

/** Axis Position Value */
export interface CT_AxPos {
  val: ST_AxPos;
}

/** Crosses Value */
export interface CT_Crosses {
  val: ST_Crosses;
}

/** Cross Between Value */
export interface CT_CrossBetween {
  val: ST_CrossBetween;
}

/** Tick Mark Value */
export interface CT_TickMark {
  val?: ST_TickMark;
}

/** Tick Label Position Value */
export interface CT_TickLblPos {
  val?: ST_TickLblPos;
}

/** Tick Skip Value */
export interface CT_Skip {
  val: ST_Skip;
}

/** Time Unit Value */
export interface CT_TimeUnit {
  val?: ST_TimeUnit;
}

/** Major Unit Value */
export interface CT_AxisUnit {
  val: ST_AxisUnit;
}

/** Built In Unit Value */
export interface CT_BuiltInUnit {
  val?: ST_BuiltInUnit;
}

/** Picture Format Value */
export interface CT_PictureFormat {
  val: ST_PictureFormat;
}

/** Picture Stack Unit */
export interface CT_PictureStackUnit {
  val: ST_PictureStackUnit;
}

/** Apply To Front */
export interface CT_PictureOptions {
  applyToFront?: CT_Boolean;
  applyToSides?: CT_Boolean;
  applyToEnd?: CT_Boolean;
  pictureFormat?: CT_PictureFormat;
  pictureStackUnit?: CT_PictureStackUnit;
}

/** Layout */
export interface CT_DispUnitsLbl {
  layout?: CT_Layout;
  tx?: CT_Tx;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
}

/** Custom Display Unit */
export interface CT_DispUnits {
  custUnit?: CT_Double;
  builtInUnit?: CT_BuiltInUnit;
  dispUnitsLbl?: CT_DispUnitsLbl;
  extLst?: CT_ExtensionList;
}

/** Orientation Value */
export interface CT_Orientation {
  val?: ST_Orientation;
}

/** Logarithmic Base Value */
export interface CT_LogBase {
  val: ST_LogBase;
}

/** Logarithmic Base */
export interface CT_Scaling {
  logBase?: CT_LogBase;
  orientation?: CT_Orientation;
  max?: CT_Double;
  min?: CT_Double;
  extLst?: CT_ExtensionList;
}

/** Label Offset Value */
export interface CT_LblOffset {
  val?: ST_LblOffset;
}

/** Automatic Category Axis */
export interface CT_CatAx {
  axId: CT_UnsignedInt;
  scaling: CT_Scaling;
  delete?: CT_Boolean;
  axPos: CT_AxPos;
  majorGridlines?: CT_ChartLines;
  minorGridlines?: CT_ChartLines;
  title?: CT_Title;
  numFmt?: CT_NumFmt;
  majorTickMark?: CT_TickMark;
  minorTickMark?: CT_TickMark;
  tickLblPos?: CT_TickLblPos;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  crossAx: CT_UnsignedInt;
  crosses: CT_Crosses;
  crossesAt: CT_Double;
  auto?: CT_Boolean;
  lblAlgn?: CT_LblAlgn;
  lblOffset?: CT_LblOffset;
  tickLblSkip?: CT_Skip;
  tickMarkSkip?: CT_Skip;
  noMultiLvlLbl?: CT_Boolean;
  extLst?: CT_ExtensionList;
}

/** Automatic Category Axis */
export interface CT_DateAx {
  axId: CT_UnsignedInt;
  scaling: CT_Scaling;
  delete?: CT_Boolean;
  axPos: CT_AxPos;
  majorGridlines?: CT_ChartLines;
  minorGridlines?: CT_ChartLines;
  title?: CT_Title;
  numFmt?: CT_NumFmt;
  majorTickMark?: CT_TickMark;
  minorTickMark?: CT_TickMark;
  tickLblPos?: CT_TickLblPos;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  crossAx: CT_UnsignedInt;
  crosses: CT_Crosses;
  crossesAt: CT_Double;
  auto?: CT_Boolean;
  lblOffset?: CT_LblOffset;
  baseTimeUnit?: CT_TimeUnit;
  majorUnit?: CT_AxisUnit;
  majorTimeUnit?: CT_TimeUnit;
  minorUnit?: CT_AxisUnit;
  minorTimeUnit?: CT_TimeUnit;
  extLst?: CT_ExtensionList;
}

/** Tick Label Skip */
export interface CT_SerAx {
  axId: CT_UnsignedInt;
  scaling: CT_Scaling;
  delete?: CT_Boolean;
  axPos: CT_AxPos;
  majorGridlines?: CT_ChartLines;
  minorGridlines?: CT_ChartLines;
  title?: CT_Title;
  numFmt?: CT_NumFmt;
  majorTickMark?: CT_TickMark;
  minorTickMark?: CT_TickMark;
  tickLblPos?: CT_TickLblPos;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  crossAx: CT_UnsignedInt;
  crosses: CT_Crosses;
  crossesAt: CT_Double;
  tickLblSkip?: CT_Skip;
  tickMarkSkip?: CT_Skip;
  extLst?: CT_ExtensionList;
}

/** Cross Between */
export interface CT_ValAx {
  axId: CT_UnsignedInt;
  scaling: CT_Scaling;
  delete?: CT_Boolean;
  axPos: CT_AxPos;
  majorGridlines?: CT_ChartLines;
  minorGridlines?: CT_ChartLines;
  title?: CT_Title;
  numFmt?: CT_NumFmt;
  majorTickMark?: CT_TickMark;
  minorTickMark?: CT_TickMark;
  tickLblPos?: CT_TickLblPos;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  crossAx: CT_UnsignedInt;
  crosses: CT_Crosses;
  crossesAt: CT_Double;
  crossBetween?: CT_CrossBetween;
  majorUnit?: CT_AxisUnit;
  minorUnit?: CT_AxisUnit;
  dispUnits?: CT_DispUnits;
  extLst?: CT_ExtensionList;
}

/** Layout */
export interface CT_PlotArea {
  layout?: CT_Layout;
  areaChart: CT_AreaChart;
  area3DChart: CT_Area3DChart;
  lineChart: CT_LineChart;
  line3DChart: CT_Line3DChart;
  stockChart: CT_StockChart;
  radarChart: CT_RadarChart;
  scatterChart: CT_ScatterChart;
  pieChart: CT_PieChart;
  pie3DChart: CT_Pie3DChart;
  doughnutChart: CT_DoughnutChart;
  barChart: CT_BarChart;
  bar3DChart: CT_Bar3DChart;
  ofPieChart: CT_OfPieChart;
  surfaceChart: CT_SurfaceChart;
  surface3DChart: CT_Surface3DChart;
  bubbleChart: CT_BubbleChart;
  valAx: CT_ValAx;
  catAx: CT_CatAx;
  dateAx: CT_DateAx;
  serAx: CT_SerAx;
  dTable?: CT_DTable;
  spPr?: CT_ShapeProperties;
  extLst?: CT_ExtensionList;
}

/** Index */
export interface CT_PivotFmt {
  idx: CT_UnsignedInt;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  marker?: CT_Marker;
  dLbl?: CT_DLbl;
  extLst?: CT_ExtensionList;
}

/** Pivot Format */
export interface CT_PivotFmts {
  pivotFmt?: CT_PivotFmt[];
}

/** Legend Position Value */
export interface CT_LegendPos {
  val?: ST_LegendPos;
}

/** Index */
export interface CT_LegendEntry {
  idx: CT_UnsignedInt;
  delete?: CT_Boolean;
  extLst?: CT_ExtensionList;
}

/** Legend Position */
export interface CT_Legend {
  legendPos?: CT_LegendPos;
  legendEntry?: CT_LegendEntry[];
  layout?: CT_Layout;
  overlay?: CT_Boolean;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  extLst?: CT_ExtensionList;
}

/** Display Blanks As Value */
export interface CT_DispBlanksAs {
  val?: ST_DispBlanksAs;
}

/** Auto Title Is Deleted */
export interface CT_Chart {
  title?: CT_Title;
  autoTitleDeleted?: CT_Boolean;
  pivotFmts?: CT_PivotFmts;
  view3D?: CT_View3D;
  floor?: CT_Surface;
  sideWall?: CT_Surface;
  backWall?: CT_Surface;
  plotArea: CT_PlotArea;
  legend?: CT_Legend;
  plotVisOnly?: CT_Boolean;
  dispBlanksAs?: CT_DispBlanksAs;
  showDLblsOverMax?: CT_Boolean;
  extLst?: CT_ExtensionList;
}

/** Style Type */
export interface CT_Style {
  val: ST_Style;
}

/** Pivot Name */
export interface CT_PivotSource {
  name: ST_Xstring;
  fmtId: CT_UnsignedInt;
  extLst?: CT_ExtensionList[];
}

/** Chart Object */
export interface CT_Protection {
  chartObject?: CT_Boolean;
  data?: CT_Boolean;
  formatting?: CT_Boolean;
  selection?: CT_Boolean;
  userInterface?: CT_Boolean;
}

/** Odd Header */
export interface CT_HeaderFooter {
  alignWithMargins?: boolean;
  differentOddEven?: boolean;
  differentFirst?: boolean;
  oddHeader?: ST_Xstring;
  oddFooter?: ST_Xstring;
  evenHeader?: ST_Xstring;
  evenFooter?: ST_Xstring;
  firstHeader?: ST_Xstring;
  firstFooter?: ST_Xstring;
}

/** Left */
export interface CT_PageMargins {
  l: number;
  r: number;
  t: number;
  b: number;
  header: number;
  footer: number;
}

/** Update Automatically */
export interface CT_ExternalData {
  id: string;
  autoUpdate?: CT_Boolean;
}

/** Page Size */
export interface CT_PageSetup {
  paperSize?: number;
  firstPageNumber?: number;
  orientation?: ST_PageSetupOrientation;
  blackAndWhite?: boolean;
  draft?: boolean;
  useFirstPageNumber?: boolean;
  horizontalDpi?: number;
  verticalDpi?: number;
  copies?: number;
}

/** Header and Footer */
export interface CT_PrintSettings {
  headerFooter?: CT_HeaderFooter;
  pageMargins?: CT_PageMargins;
  pageSetup?: CT_PageSetup;
  legacyDrawingHF?: CT_RelId;
}

/** 1904 Date System */
export interface CT_ChartSpace {
  date1904?: CT_Boolean;
  lang?: CT_TextLanguageID;
  roundedCorners?: CT_Boolean;
  style?: CT_Style;
  clrMapOvr?: CT_ColorMapping;
  pivotSource?: CT_PivotSource;
  protection?: CT_Protection;
  chart: CT_Chart;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  externalData?: CT_ExternalData;
  printSettings?: CT_PrintSettings;
  userShapes?: CT_RelId;
  extLst?: CT_ExtensionList;
}
