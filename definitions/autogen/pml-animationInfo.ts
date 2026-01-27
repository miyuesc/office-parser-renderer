import {
  CT_EmbeddedWAVAudioFile,
  ST_FixedPercentage,
  ST_Percentage,
  ST_PositiveFixedPercentage,
  ST_PositivePercentage
} from './dml-baseTypes';
import { CT_AnimationElementChoice, CT_AnimationGraphicalObjectBuildProperties } from './dml-graphicalObjectAnimation';
import { ST_ShapeID } from './dml-shapeMiscellaneous';
import { CT_ExtensionListModify, CT_IndexRange, ST_Direction } from './pml-baseTypes';
import { ST_Angle } from './vml-officeDrawing';
import { CT_Color, CT_Empty } from './wml';

/**
 * pml-animationInfo.xsd
 */

/** Transition Slide Direction Type */
export enum ST_TransitionSideDirectionType {
  /** Transition Slide Direction Enum ( Left ) */
  l = 'l',
  /** Transition Slide Direction Enum ( Up ) */
  u = 'u',
  /** Transition Slide Direction ( Right ) */
  r = 'r',
  /** Transition Slide Direction Enum ( Down ) */
  d = 'd'
}

/** Transition Corner Direction Type */
export enum ST_TransitionCornerDirectionType {
  /** Transition Corner Direction Enum ( Left-Up ) */
  lu = 'lu',
  /** Transition Corner Direction Enum ( Right-Up ) */
  ru = 'ru',
  /** Transition Corner Direction Enum ( Left-Down ) */
  ld = 'ld',
  /** Transition Corner Direction Enum ( Right-Down ) */
  rd = 'rd'
}

/** Transition In/Out Direction Type */
export enum ST_TransitionInOutDirectionType {
  /** Transition In/Out Direction Enum ( Out ) */
  out = 'out',
  /** Transition In/Out Direction Enum ( In ) */
  in = 'in'
}

/** Transition Eight Direction */
export type ST_TransitionEightDirectionType = string;

/** Transition Speed */
export enum ST_TransitionSpeed {
  /** low */
  slow = 'slow',
  /** Medium */
  med = 'med',
  /** Fast */
  fast = 'fast'
}

/** Indefinite Time Declaration */
export enum ST_TLTimeIndefinite {
  /** Indefinite Type Enum */
  indefinite = 'indefinite'
}

/** Time */
export type ST_TLTime = string;

/** Time Node ID */
export type ST_TLTimeNodeID = string;

/** Iterate Type */
export enum ST_IterateType {
  /** Element */
  el = 'el',
  /** Word */
  wd = 'wd',
  /** Letter */
  lt = 'lt'
}

/** Chart Subelement Type */
export enum ST_TLChartSubelementType {
  /** Chart Build Element Type Enum ( Grid Legend ) */
  gridLegend = 'gridLegend',
  /** Chart Build Element Type Enum ( Series ) */
  series = 'series',
  /** Chart Build Element Type Enum ( Category ) */
  category = 'category',
  /** Chart Build Element Type Enum ( Point in Series ) */
  ptInSeries = 'ptInSeries',
  /** Chart Build Element Type Enum ( Point in Cat ) */
  ptInCategory = 'ptInCategory'
}

/** Trigger RunTime Node */
export enum ST_TLTriggerRuntimeNode {
  /** Trigger RunTime Node ( First ) */
  first = 'first',
  /** Trigger RunTime Node ( Last ) */
  last = 'last',
  /** Trigger RunTime Node Enum ( All ) */
  all = 'all'
}

/** Trigger Event */
export enum ST_TLTriggerEvent {
  /** Trigger Event Enum ( On Begin ) */
  onBegin = 'onBegin',
  /** Trigger Event Enum ( On End ) */
  onEnd = 'onEnd',
  /** Trigger Event Enum ( Begin ) */
  begin = 'begin',
  /** Trigger Event Enum ( End ) */
  end = 'end',
  /** Trigger Event Enum ( On Click ) */
  onClick = 'onClick',
  /** Trigger Event Enum ( On Double Click ) */
  onDblClick = 'onDblClick',
  /** Trigger Event Enum ( On Mouse Over ) */
  onMouseOver = 'onMouseOver',
  /** Trigger Event Enum ( On Mouse Out ) */
  onMouseOut = 'onMouseOut',
  /** Trigger Event Enum ( On Next ) */
  onNext = 'onNext',
  /** Trigger Event Enum ( On Previous ) */
  onPrev = 'onPrev',
  /** Trigger Event Enum ( On Stop Audio ) */
  onStopAudio = 'onStopAudio'
}

/** Time Node Preset Class Type */
export enum ST_TLTimeNodePresetClassType {
  /** Preset Type Enum ( Entrance ) */
  entr = 'entr',
  /** Exit */
  exit = 'exit',
  /** Preset Type Enum ( Emphasis ) */
  emph = 'emph',
  /** Preset Type Enum ( Path ) */
  path = 'path',
  /** Preset Type Enum ( Verb ) */
  verb = 'verb',
  /** Preset Type Enum ( Media Call ) */
  mediacall = 'mediacall'
}

/** Time Node Restart Type */
export enum ST_TLTimeNodeRestartType {
  /** Restart Enum ( Always ) */
  always = 'always',
  /** Restart Enum ( When Not Active ) */
  whenNotActive = 'whenNotActive',
  /** Restart Enum ( Never ) */
  never = 'never'
}

/** Time Node Fill Type */
export enum ST_TLTimeNodeFillType {
  /** Remove */
  remove = 'remove',
  /** Freeze */
  freeze = 'freeze',
  /** TimeNode Fill Type Enum ( Hold ) */
  hold = 'hold',
  /** Transition */
  transition = 'transition'
}

/** Time Node Sync Type */
export enum ST_TLTimeNodeSyncType {
  /** TimeNode Sync Enum ( Can Slip ) */
  canSlip = 'canSlip',
  /** TimeNode Sync Enum ( Locked ) */
  locked = 'locked'
}

/** Time Node Master Relation */
export enum ST_TLTimeNodeMasterRelation {
  /** TimeNode Master Relation Enum ( Same Click ) */
  sameClick = 'sameClick',
  /** TimeNode Master Relation Enum ( Last Click ) */
  lastClick = 'lastClick',
  /** TimeNode Master Relation Enum ( Next Click ) */
  nextClick = 'nextClick'
}

/** Time Node Type */
export enum ST_TLTimeNodeType {
  /** Node Type Enum ( Click Effect ) */
  clickEffect = 'clickEffect',
  /** Node Type Enum ( With Effect ) */
  withEffect = 'withEffect',
  /** Node Type Enum ( After Effect ) */
  afterEffect = 'afterEffect',
  /** Node Type Enum ( Main Sequence ) */
  mainSeq = 'mainSeq',
  /** Node Type Enum ( Interactive Sequence ) */
  interactiveSeq = 'interactiveSeq',
  /** Node Type Enum ( Click Paragraph ) */
  clickPar = 'clickPar',
  /** Node Type Enum ( With Group ) */
  withGroup = 'withGroup',
  /** Node Type Enum ( After Group ) */
  afterGroup = 'afterGroup',
  /** Node Type Enum ( Timing Root ) */
  tmRoot = 'tmRoot'
}

/** Next Action Type */
export enum ST_TLNextActionType {
  /** Next Action Type Enum ( None ) */
  none = 'none',
  /** Next Action Type Enum ( Seek ) */
  seek = 'seek'
}

/** Previous Action Type */
export enum ST_TLPreviousActionType {
  /** Previous Action Type Enum ( None ) */
  none = 'none',
  /** Previous Action Type Enum ( Skip Timed ) */
  skipTimed = 'skipTimed'
}

/** Behavior Additive Type */
export enum ST_TLBehaviorAdditiveType {
  /** Additive Enum ( Base ) */
  base = 'base',
  /** Additive Enum ( Sum ) */
  sum = 'sum',
  /** Additive Enum ( Replace ) */
  repl = 'repl',
  /** Additive Enum ( Multiply ) */
  mult = 'mult',
  /** None */
  none = 'none'
}

/** Behavior Accumulate Type */
export enum ST_TLBehaviorAccumulateType {
  /** Accumulate Enum ( None ) */
  none = 'none',
  /** Accumulate Enum ( Always ) */
  always = 'always'
}

/** Behavior Transform Type */
export enum ST_TLBehaviorTransformType {
  /** Point */
  pt = 'pt',
  /** Image */
  img = 'img'
}

/** Behavior Override Type */
export enum ST_TLBehaviorOverrideType {
  /** Override Enum ( Normal ) */
  normal = 'normal',
  /** Override Enum ( Child Style ) */
  childStyle = 'childStyle'
}

/** Animation Time */
export type ST_TLTimeAnimateValueTime = string;

/** Time List Animate Behavior Calculate Mode */
export enum ST_TLAnimateBehaviorCalcMode {
  /** Calc Mode Enum ( Discrete ) */
  discrete = 'discrete',
  /** Calc Mode Enum ( Linear ) */
  lin = 'lin',
  /** Calc Mode Enum ( Formula ) */
  fmla = 'fmla'
}

/** Time List Animate Behavior Value Types */
export enum ST_TLAnimateBehaviorValueType {
  /** Value Type Enum ( String ) */
  str = 'str',
  /** Value Type Enum ( Number ) */
  num = 'num',
  /** Value Type Enum ( Color ) */
  clr = 'clr'
}

/** Time List Animate Color Space */
export enum ST_TLAnimateColorSpace {
  /** Color Space Enum ( RGB ) */
  rgb = 'rgb',
  /** Color Space Enum ( HSL ) */
  hsl = 'hsl'
}

/** Time List Animate Color Direction */
export enum ST_TLAnimateColorDirection {
  /** Direction Enum ( Clockwise ) */
  cw = 'cw',
  /** Counter-Clockwise */
  ccw = 'ccw'
}

/** Time List Animate Effect Transition */
export enum ST_TLAnimateEffectTransition {
  /** Transition Enum ( In ) */
  in = 'in',
  /** Transition Enum ( Out ) */
  out = 'out',
  /** Transition Enum ( None ) */
  none = 'none'
}

/** Time List Animate Motion Behavior Origin */
export enum ST_TLAnimateMotionBehaviorOrigin {
  /** Origin Enum ( Parent ) */
  parent = 'parent',
  /** Origin Enum ( Layout ) */
  layout = 'layout'
}

/** Time List Animate Motion Path Edit Mode */
export enum ST_TLAnimateMotionPathEditMode {
  /** Path Edit Mode Enum ( Relative ) */
  relative = 'relative',
  /** Path Edit Mode Enum ( Fixed ) */
  fixed = 'fixed'
}

/** Command Type */
export enum ST_TLCommandType {
  /** Command Type Enum ( Event ) */
  evt = 'evt',
  /** Command Type Enum ( Call ) */
  call = 'call',
  /** Command Type Enum ( Verb ) */
  verb = 'verb'
}

/** Paragraph Build Type */
export enum ST_TLParaBuildType {
  /** All At Once */
  allAtOnce = 'allAtOnce',
  /** Paragraph */
  p = 'p',
  /** Custom */
  cust = 'cust',
  /** Whole */
  whole = 'whole'
}

/** Diagram Build Types */
export enum ST_TLDiagramBuildType {
  /** Diagram Build Type Enum ( Whole ) */
  whole = 'whole',
  /** Diagram Build Type Enum ( Depth By Node ) */
  depthByNode = 'depthByNode',
  /** Diagram Build Type Enum ( Depth By Branch ) */
  depthByBranch = 'depthByBranch',
  /** Diagram Build Type Enum ( Breadth By Node ) */
  breadthByNode = 'breadthByNode',
  /** Diagram Build Type Enum ( Breadth By Level ) */
  breadthByLvl = 'breadthByLvl',
  /** Diagram Build Type Enum ( Clockwise ) */
  cw = 'cw',
  /** Diagram Build Type Enum ( Clockwise-In ) */
  cwIn = 'cwIn',
  /** Diagram Build Type Enum ( Clockwise-Out ) */
  cwOut = 'cwOut',
  /** Diagram Build Type Enum ( Counter-Clockwise ) */
  ccw = 'ccw',
  /** Diagram Build Type Enum ( Counter-Clockwise-In ) */
  ccwIn = 'ccwIn',
  /** Diagram Build Type Enum ( Counter-Clockwise-Out ) */
  ccwOut = 'ccwOut',
  /** Diagram Build Type Enum ( In-By-Ring ) */
  inByRing = 'inByRing',
  /** Diagram Build Type Enum ( Out-By-Ring ) */
  outByRing = 'outByRing',
  /** Diagram Build Type Enum ( Up ) */
  up = 'up',
  /** Diagram Build Type Enum ( Down ) */
  down = 'down',
  /** Diagram Build Type Enum ( All At Once ) */
  allAtOnce = 'allAtOnce',
  /** Diagram Build Type Enum ( Custom ) */
  cust = 'cust'
}

/** OLE Chart Build Type */
export enum ST_TLOleChartBuildType {
  /** Chart Build Type Enum ( All At Once ) */
  allAtOnce = 'allAtOnce',
  /** Chart Build Type Enum ( Series ) */
  series = 'series',
  /** Chart Build Type Enum ( Category ) */
  category = 'category',
  /** Chart Build Type Enum ( Series Element ) */
  seriesEl = 'seriesEl',
  /** Chart Build Type Enum ( Category Element ) */
  categoryEl = 'categoryEl'
}

/** Direction */
export interface CT_SideDirectionTransition {
  dir?: ST_TransitionSideDirectionType;
}

/** Direction */
export interface CT_CornerDirectionTransition {
  dir?: ST_TransitionCornerDirectionType;
}

/** Direction */
export interface CT_EightDirectionTransition {
  dir?: ST_TransitionEightDirectionType;
}

/** Transition Direction */
export interface CT_OrientationTransition {
  dir?: ST_Direction;
}

/** Direction */
export interface CT_InOutTransition {
  dir?: ST_TransitionInOutDirectionType;
}

/** Transition Through Black */
export interface CT_OptionalBlackTransition {
  thruBlk?: boolean;
}

/** Orientation */
export interface CT_SplitTransition {
  orient?: ST_Direction;
  dir?: ST_TransitionInOutDirectionType;
}

/** Spokes */
export interface CT_WheelTransition {
  spokes?: number;
}

/** Sound */
export interface CT_TransitionStartSoundAction {
  loop?: boolean;
}

/** Start Sound Action */
export interface CT_TransitionSoundAction {
  stSnd: CT_TransitionStartSoundAction;
  endSnd: CT_Empty;
}

/** Blinds Slide Transition */
export interface CT_SlideTransition {
  spd?: ST_TransitionSpeed;
  advClick?: boolean;
  advTm?: number;
  blinds: CT_OrientationTransition;
  checker: CT_OrientationTransition;
  circle: CT_Empty;
  dissolve: CT_Empty;
  comb: CT_OrientationTransition;
  cover: CT_EightDirectionTransition;
  cut: CT_OptionalBlackTransition;
  diamond: CT_Empty;
  fade: CT_OptionalBlackTransition;
  newsflash: CT_Empty;
  plus: CT_Empty;
  pull: CT_EightDirectionTransition;
  push: CT_SideDirectionTransition;
  random: CT_Empty;
  randomBar: CT_OrientationTransition;
  split: CT_SplitTransition;
  strips: CT_CornerDirectionTransition;
  wedge: CT_Empty;
  wheel: CT_WheelTransition;
  wipe: CT_SideDirectionTransition;
  zoom: CT_InOutTransition;
  sndAc?: any;
  extLst?: CT_ExtensionListModify;
}

/** Time */
export interface CT_TLIterateIntervalTime {
  val: ST_TLTime;
}

/** Value */
export interface CT_TLIterateIntervalPercentage {
  val: ST_PositivePercentage;
}

/** Time Absolute */
export interface CT_TLIterateData {
  type?: ST_IterateType;
  backwards?: boolean;
  tmAbs: CT_TLIterateIntervalTime;
  tmPct: CT_TLIterateIntervalPercentage;
}

/** Shape ID */
export interface CT_TLSubShapeId {
  spid: ST_ShapeID;
}

/** Character Range */
export interface CT_TLTextTargetElement {
  charRg: CT_IndexRange;
  pRg: CT_IndexRange;
}

/** Type */
export interface CT_TLOleChartTargetElement {
  type: ST_TLChartSubelementType;
  lvl?: number;
}

/** Background */
export interface CT_TLShapeTargetElement {
  spid: ST_ShapeID;
  bg: CT_Empty;
  subSp: CT_TLSubShapeId;
  oleChartEl: CT_TLOleChartTargetElement;
  txEl: CT_TLTextTargetElement;
  graphicEl: CT_AnimationElementChoice;
}

/** Slide Target */
export interface CT_TLTimeTargetElement {
  sldTgt: CT_Empty;
  sndTgt: CT_EmbeddedWAVAudioFile;
  spTgt: CT_TLShapeTargetElement;
  inkTgt: CT_TLSubShapeId;
}

/** Value */
export interface CT_TLTriggerTimeNodeID {
  val: ST_TLTimeNodeID;
}

/** Value */
export interface CT_TLTriggerRuntimeNode {
  val: ST_TLTriggerRuntimeNode;
}

/** Target Element Trigger Choice */
export interface CT_TLTimeCondition {
  evt?: any;
  delay?: ST_TLTime;
  tgtEl: CT_TLTimeTargetElement;
  tn: CT_TLTriggerTimeNodeID;
  rtn: CT_TLTriggerRuntimeNode;
}

/** Condition */
export interface CT_TLTimeConditionList {
  cond: CT_TLTimeCondition[];
}

/** Parallel Time Node */
export interface CT_TimeNodeList {
  par: CT_TLTimeNodeParallel;
  seq: CT_TLTimeNodeSequence;
  excl: CT_TLTimeNodeExclusive;
  anim: CT_TLAnimateBehavior;
  animClr: CT_TLAnimateColorBehavior;
  animEffect: CT_TLAnimateEffectBehavior;
  animMotion: CT_TLAnimateMotionBehavior;
  animRot: CT_TLAnimateRotationBehavior;
  animScale: CT_TLAnimateScaleBehavior;
  cmd: CT_TLCommandBehavior;
  set: CT_TLSetBehavior;
  audio: CT_TLMediaNodeAudio;
  video: CT_TLMediaNodeVideo;
}

/** Start Conditions List */
export interface CT_TLCommonTimeNodeData {
  id?: ST_TLTimeNodeID;
  presetID?: number;
  presetClass?: ST_TLTimeNodePresetClassType;
  presetSubtype?: number;
  dur?: ST_TLTime;
  repeatCount?: ST_TLTime;
  repeatDur?: ST_TLTime;
  spd?: ST_Percentage;
  accel?: ST_PositiveFixedPercentage;
  decel?: ST_PositiveFixedPercentage;
  autoRev?: boolean;
  restart?: ST_TLTimeNodeRestartType;
  fill?: ST_TLTimeNodeFillType;
  syncBehavior?: ST_TLTimeNodeSyncType;
  tmFilter?: string;
  evtFilter?: string;
  display?: boolean;
  masterRel?: ST_TLTimeNodeMasterRelation;
  bldLvl?: number;
  grpId?: number;
  afterEffect?: boolean;
  nodeType?: ST_TLTimeNodeType;
  nodePh?: boolean;
  stCondLst?: CT_TLTimeConditionList;
  endCondLst?: CT_TLTimeConditionList;
  endSync?: CT_TLTimeCondition;
  iterate?: CT_TLIterateData;
  childTnLst?: CT_TimeNodeList;
  subTnLst?: CT_TimeNodeList;
}

/** Parallel TimeNode */
export interface CT_TLTimeNodeParallel {
  cTn: CT_TLCommonTimeNodeData;
}

/** Common TimeNode Properties */
export interface CT_TLTimeNodeSequence {
  concurrent?: boolean;
  prevAc?: ST_TLPreviousActionType;
  nextAc?: ST_TLNextActionType;
  cTn: CT_TLCommonTimeNodeData;
  prevCondLst?: CT_TLTimeConditionList;
  nextCondLst?: CT_TLTimeConditionList;
}

/** Common TimeNode Properties */
export interface CT_TLTimeNodeExclusive {
  cTn: CT_TLCommonTimeNodeData;
}

/** Attribute Name */
export interface CT_TLBehaviorAttributeNameList {
  attrName: string[];
}

/** Target Element */
export interface CT_TLCommonBehaviorData {
  additive?: ST_TLBehaviorAdditiveType;
  accumulate?: ST_TLBehaviorAccumulateType;
  xfrmType?: ST_TLBehaviorTransformType;
  from?: string;
  to?: string;
  by?: string;
  rctx?: string;
  override?: ST_TLBehaviorOverrideType;
  cTn: CT_TLCommonTimeNodeData;
  tgtEl: CT_TLTimeTargetElement;
  attrNameLst?: CT_TLBehaviorAttributeNameList;
}

/** Value */
export interface CT_TLAnimVariantBooleanVal {
  val: boolean;
}

/** Value */
export interface CT_TLAnimVariantIntegerVal {
  val: number;
}

/** Value */
export interface CT_TLAnimVariantFloatVal {
  val: number;
}

/** Value */
export interface CT_TLAnimVariantStringVal {
  val: string;
}

/** Boolean Variant */
export interface CT_TLAnimVariant {
  boolVal: CT_TLAnimVariantBooleanVal;
  intVal: CT_TLAnimVariantIntegerVal;
  fltVal: CT_TLAnimVariantFloatVal;
  strVal: CT_TLAnimVariantStringVal;
  clrVal: CT_Color;
}

/** Value */
export interface CT_TLTimeAnimateValue {
  tm?: ST_TLTimeAnimateValueTime;
  fmla?: string;
  val?: CT_TLAnimVariant;
}

/** Time Animate Value */
export interface CT_TLTimeAnimateValueList {
  tav?: CT_TLTimeAnimateValue[];
}

/** Time Animated Value List */
export interface CT_TLAnimateBehavior {
  by?: string;
  from?: string;
  to?: string;
  calcmode?: ST_TLAnimateBehaviorCalcMode;
  valueType?: ST_TLAnimateBehaviorValueType;
  cBhvr: CT_TLCommonBehaviorData;
  tavLst?: CT_TLTimeAnimateValueList;
}

/** Red */
export interface CT_TLByRgbColorTransform {
  r: ST_FixedPercentage;
  g: ST_FixedPercentage;
  b: ST_FixedPercentage;
}

/** Hue */
export interface CT_TLByHslColorTransform {
  h: ST_Angle;
  s: ST_FixedPercentage;
  l: ST_FixedPercentage;
}

/** RGB */
export interface CT_TLByAnimateColorTransform {
  rgb: CT_TLByRgbColorTransform;
  hsl: CT_TLByHslColorTransform;
}

/** By */
export interface CT_TLAnimateColorBehavior {
  clrSpc?: ST_TLAnimateColorSpace;
  dir?: ST_TLAnimateColorDirection;
  cBhvr: CT_TLCommonBehaviorData;
  by?: CT_TLByAnimateColorTransform;
  from?: CT_Color;
  to?: CT_Color;
}

/** Progress */
export interface CT_TLAnimateEffectBehavior {
  transition?: ST_TLAnimateEffectTransition;
  filter?: string;
  prLst?: string;
  cBhvr: CT_TLCommonBehaviorData;
  progress?: CT_TLAnimVariant;
}

/** X coordinate */
export interface CT_TLPoint {
  x: ST_Percentage;
  y: ST_Percentage;
}

/** From */
export interface CT_TLAnimateMotionBehavior {
  origin?: ST_TLAnimateMotionBehaviorOrigin;
  path?: string;
  pathEditMode?: ST_TLAnimateMotionPathEditMode;
  rAng?: ST_Angle;
  ptsTypes?: string;
  cBhvr: CT_TLCommonBehaviorData;
  by?: CT_TLPoint;
  from?: CT_TLPoint;
  to?: CT_TLPoint;
  rCtr?: CT_TLPoint;
}

/** By */
export interface CT_TLAnimateRotationBehavior {
  by?: ST_Angle;
  from?: ST_Angle;
  to?: ST_Angle;
  cBhvr: CT_TLCommonBehaviorData;
}

/** By */
export interface CT_TLAnimateScaleBehavior {
  zoomContents?: boolean;
  cBhvr: CT_TLCommonBehaviorData;
  by?: CT_TLPoint;
  from?: CT_TLPoint;
  to?: CT_TLPoint;
}

/** Command Type */
export interface CT_TLCommandBehavior {
  cmd?: string;
  cBhvr: CT_TLCommonBehaviorData;
}

/** Common Behavior */
export interface CT_TLSetBehavior {
  cBhvr: CT_TLCommonBehaviorData;
  to?: CT_TLAnimVariant;
}

/** Common Time Node Properties */
export interface CT_TLCommonMediaNodeData {
  vol?: ST_PositiveFixedPercentage;
  mute?: boolean;
  numSld?: number;
  showWhenStopped?: boolean;
  cTn: CT_TLCommonTimeNodeData;
  tgtEl: CT_TLTimeTargetElement;
}

/** Common Media Node Properties */
export interface CT_TLMediaNodeAudio {
  isNarration?: boolean;
  cMediaNode: CT_TLCommonMediaNodeData;
}

/** Common Media Node Properties */
export interface CT_TLMediaNodeVideo {
  fullScrn?: boolean;
  cMediaNode: CT_TLCommonMediaNodeData;
}

/** Time Node List */
export interface CT_TLTemplate {
  lvl?: number;
  tnLst: CT_TimeNodeList;
}

/** Template Effects */
export interface CT_TLTemplateList {
  tmpl?: CT_TLTemplate[];
}

/** Template effects */
export interface CT_TLBuildParagraph {
  build?: ST_TLParaBuildType;
  bldLvl?: number;
  animBg?: boolean;
  autoUpdateAnimBg?: boolean;
  rev?: boolean;
  advAuto?: ST_TLTime;
  tmplLst?: CT_TLTemplateList;
}

/** Diagram Build Types */
export interface CT_TLBuildDiagram {
  bld?: ST_TLDiagramBuildType;
}

/** Build */
export interface CT_TLOleBuildChart {
  bld?: ST_TLOleChartBuildType;
  animBg?: boolean;
}

/** Build As One */
export interface CT_TLGraphicalObjectBuild {
  bldAsOne: CT_Empty;
  bldSub: CT_AnimationGraphicalObjectBuildProperties;
}

/** Build Paragraph */
export interface CT_BuildList {
  bldP: CT_TLBuildParagraph;
  bldDgm: CT_TLBuildDiagram;
  bldOleChart: CT_TLOleBuildChart;
  bldGraphic: CT_TLGraphicalObjectBuild;
}

/** Build List */
export interface CT_SlideTiming {
  tnLst?: CT_TimeNodeList;
  bldLst?: CT_BuildList;
  extLst?: CT_ExtensionListModify;
}
