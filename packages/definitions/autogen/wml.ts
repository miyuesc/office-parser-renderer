import { CT_Empty } from './common-types';
import {
  CT_Text,
  CT_TwipsMeasure,
  ST_Guid,
  ST_Panose,
  ST_String,
  ST_TwipsMeasure,
} from './common-types';
import {
  CT_Acc,
  CT_Bar,
  CT_BorderBox,
  CT_Box,
  CT_D,
  CT_EqArr,
  CT_Func,
  CT_GroupChr,
  CT_LimLow,
  CT_LimUpp,
  CT_M,
  CT_Nary,
  CT_Phant,
  CT_Rad,
  CT_SPre,
  CT_SSub,
  CT_SSubSup,
  CT_SSup,
} from './shared-math';
import { CT_F } from './vml-main';

/**
 * wml.xsd
 */

/** On/Off Value */
export enum ST_OnOff {
  /** True */
  true = 'true',
  /** False */
  false = 'false',
  /** True */
  on = 'on',
  /** False */
  off = 'off',
  /** False */
  _0 = '0',
  /** True */
  _1 = '1',
}

/** Four Digit Hexadecimal Number Value */
export type ST_LongHexNumber = string;

/** Two Digit Hexadecimal Number Value */
export type ST_ShortHexNumber = string;

/** Two Digit Hexadecimal Number Value */
export type ST_UcharHexNumber = string;

/** Decimal Number Value */
export type ST_DecimalNumber = string;

/** Unsigned Decimal Number Value */
export type ST_UnsignedDecimalNumber = string;

/** Measurement in Twentieths of a Point */

/** Signed Measurement in Twentieths of a Point */
export type ST_SignedTwipsMeasure = string;

/** Measurement in Pixels */
export type ST_PixelsMeasure = string;

/** Measurement in Half-Points */
export type ST_HpsMeasure = string;

/** Signed Measurement in Half-Points */
export type ST_SignedHpsMeasure = string;

/** Standard Date and Time Storage Format */
export type ST_DateTime = string;

/** Script Subroutine Name Value */
export type ST_MacroName = string;

/** Measurement in Eighths of a Point */
export type ST_EighthPointMeasure = string;

/** Measurement in Points */
export type ST_PointMeasure = string;

/** String */

/** Text Expansion/Compression Percentage */
export type ST_TextScale = number;

/** Text Highlight Colors */
export enum ST_HighlightColor {
  /** Black Highlighting Color */
  black = 'black',
  /** Blue Highlighting Color */
  blue = 'blue',
  /** Cyan Highlighting Color */
  cyan = 'cyan',
  /** Green Highlighting Color */
  green = 'green',
  /** Magenta Highlighting Color */
  magenta = 'magenta',
  /** Red Highlighting Color */
  red = 'red',
  /** Yellow Highlighting Color */
  yellow = 'yellow',
  /** White Highlighting Color */
  white = 'white',
  /** Dark Blue Highlighting Color */
  darkBlue = 'darkBlue',
  /** Dark Cyan Highlighting Color */
  darkCyan = 'darkCyan',
  /** Dark Green Highlighting Color */
  darkGreen = 'darkGreen',
  /** Dark Magenta Highlighting Color */
  darkMagenta = 'darkMagenta',
  /** Dark Red Highlighting Color */
  darkRed = 'darkRed',
  /** Dark Yellow Highlighting Color */
  darkYellow = 'darkYellow',
  /** Dark Gray Highlighting Color */
  darkGray = 'darkGray',
  /** Light Gray Highlighting Color */
  lightGray = 'lightGray',
  /** No Text Highlighting */
  none = 'none',
}

/** ‘Automatic’ Color Value */
export enum ST_HexColorAuto {
  /** Automatically Determined Color */
  auto = 'auto',
}

/** Hexadecimal Color Value */
export type ST_HexColorRGB = string;

/** Color Value */
export type ST_HexColor = string;

/** Two Digit Hexadecimal Language Code */
export type ST_LangCode = string;

/** Language Reference */
export type ST_Lang = string;

/** 128-Bit GUID */

/** Underline Patterns */
export enum ST_Underline {
  /** Single Underline */
  single = 'single',
  /** Underline Non-Space Characters Only */
  words = 'words',
  /** Double Underline */
  double = 'double',
  /** Thick Underline */
  thick = 'thick',
  /** Dotted Underline */
  dotted = 'dotted',
  /** Thick Dotted Underline */
  dottedHeavy = 'dottedHeavy',
  /** Dashed Underline */
  dash = 'dash',
  /** Thick Dashed Underline */
  dashedHeavy = 'dashedHeavy',
  /** Long Dashed Underline */
  dashLong = 'dashLong',
  /** Thick Long Dashed Underline */
  dashLongHeavy = 'dashLongHeavy',
  /** Dash-Dot Underline */
  dotDash = 'dotDash',
  /** Thick Dash-Dot Underline */
  dashDotHeavy = 'dashDotHeavy',
  /** Dash-Dot-Dot Underline */
  dotDotDash = 'dotDotDash',
  /** Thick Dash-Dot-Dot Underline */
  dashDotDotHeavy = 'dashDotDotHeavy',
  /** Wave Underline */
  wave = 'wave',
  /** Heavy Wave Underline */
  wavyHeavy = 'wavyHeavy',
  /** Double Wave Underline */
  wavyDouble = 'wavyDouble',
  /** No Underline */
  none = 'none',
}

/** Animated Text Effects */
export enum ST_TextEffect {
  /** Blinking Background Animation */
  blinkBackground = 'blinkBackground',
  /** Colored Lights Animation */
  lights = 'lights',
  /** Black Dashed Line Animation */
  antsBlack = 'antsBlack',
  /** Marching Red Ants */
  antsRed = 'antsRed',
  /** Shimmer Animation */
  shimmer = 'shimmer',
  /** Sparkling Lights Animation */
  sparkle = 'sparkle',
  /** No Animation */
  none = 'none',
}

/** Border Styles */
export enum ST_Border {
  /** No Border */
  nil = 'nil',
  /** No Border */
  none = 'none',
  /** Single Line Border */
  single = 'single',
  /** Single Line Border */
  thick = 'thick',
  /** Double Line Border */
  double = 'double',
  /** Dotted Line Border */
  dotted = 'dotted',
  /** Dashed Line Border */
  dashed = 'dashed',
  /** Dot Dash Line Border */
  dotDash = 'dotDash',
  /** Dot Dot Dash Line Border */
  dotDotDash = 'dotDotDash',
  /** Triple Line Border */
  triple = 'triple',
  /** Thin, Thick Line Border */
  thinThickSmallGap = 'thinThickSmallGap',
  /** Thick, Thin Line Border */
  thickThinSmallGap = 'thickThinSmallGap',
  /** Thin, Thick, Thin Line Border */
  thinThickThinSmallGap = 'thinThickThinSmallGap',
  /** Thin, Thick Line Border */
  thinThickMediumGap = 'thinThickMediumGap',
  /** Thick, Thin Line Border */
  thickThinMediumGap = 'thickThinMediumGap',
  /** Thin, Thick, Thin Line Border */
  thinThickThinMediumGap = 'thinThickThinMediumGap',
  /** Thin, Thick Line Border */
  thinThickLargeGap = 'thinThickLargeGap',
  /** Thick, Thin Line Border */
  thickThinLargeGap = 'thickThinLargeGap',
  /** Thin, Thick, Thin Line Border */
  thinThickThinLargeGap = 'thinThickThinLargeGap',
  /** Wavy Line Border */
  wave = 'wave',
  /** Double Wave Line Border */
  doubleWave = 'doubleWave',
  /** Dashed Line Border */
  dashSmallGap = 'dashSmallGap',
  /** Dash Dot Strokes Line Border */
  dashDotStroked = 'dashDotStroked',
  /** 3D Embossed Line Border */
  threeDEmboss = 'threeDEmboss',
  /** 3D Engraved Line Border */
  threeDEngrave = 'threeDEngrave',
  /** Outset Line Border */
  outset = 'outset',
  /** Inset Line Border */
  inset = 'inset',
  /** Apples Art Border */
  apples = 'apples',
  /** Arched Scallops Art Border */
  archedScallops = 'archedScallops',
  /** Baby Pacifier Art Border */
  babyPacifier = 'babyPacifier',
  /** Baby Rattle Art Border */
  babyRattle = 'babyRattle',
  /** Three Color Balloons Art Border */
  balloons3Colors = 'balloons3Colors',
  /** Hot Air Balloons Art Border */
  balloonsHotAir = 'balloonsHotAir',
  /** Black Dash Art Border */
  basicBlackDashes = 'basicBlackDashes',
  /** Black Dot Art Border */
  basicBlackDots = 'basicBlackDots',
  /** Black Square Art Border */
  basicBlackSquares = 'basicBlackSquares',
  /** Thin Line Art Border */
  basicThinLines = 'basicThinLines',
  /** White Dash Art Border */
  basicWhiteDashes = 'basicWhiteDashes',
  /** White Dot Art Border */
  basicWhiteDots = 'basicWhiteDots',
  /** White Square Art Border */
  basicWhiteSquares = 'basicWhiteSquares',
  /** Wide Inline Art Border */
  basicWideInline = 'basicWideInline',
  /** Wide Midline Art Border */
  basicWideMidline = 'basicWideMidline',
  /** Wide Outline Art Border */
  basicWideOutline = 'basicWideOutline',
  /** Bats Art Border */
  bats = 'bats',
  /** Birds Art Border */
  birds = 'birds',
  /** Birds Flying Art Border */
  birdsFlight = 'birdsFlight',
  /** Cabin Art Border */
  cabins = 'cabins',
  /** Cake Art Border */
  cakeSlice = 'cakeSlice',
  /** Candy Corn Art Border */
  candyCorn = 'candyCorn',
  /** Knot Work Art Border */
  celticKnotwork = 'celticKnotwork',
  /** Certificate Banner Art Border */
  certificateBanner = 'certificateBanner',
  /** Chain Link Art Border */
  chainLink = 'chainLink',
  /** Champagne Bottle Art Border */
  champagneBottle = 'champagneBottle',
  /** Black and White Bar Art Border */
  checkedBarBlack = 'checkedBarBlack',
  /** Color Checked Bar Art Border */
  checkedBarColor = 'checkedBarColor',
  /** Checkerboard Art Border */
  checkered = 'checkered',
  /** Christmas Tree Art Border */
  christmasTree = 'christmasTree',
  /** Circles And Lines Art Border */
  circlesLines = 'circlesLines',
  /** Circles and Rectangles Art Border */
  circlesRectangles = 'circlesRectangles',
  /** Wave Art Border */
  classicalWave = 'classicalWave',
  /** Clocks Art Border */
  clocks = 'clocks',
  /** Compass Art Border */
  compass = 'compass',
  /** Confetti Art Border */
  confetti = 'confetti',
  /** Confetti Art Border */
  confettiGrays = 'confettiGrays',
  /** Confetti Art Border */
  confettiOutline = 'confettiOutline',
  /** Confetti Streamers Art Border */
  confettiStreamers = 'confettiStreamers',
  /** Confetti Art Border */
  confettiWhite = 'confettiWhite',
  /** Corner Triangle Art Border */
  cornerTriangles = 'cornerTriangles',
  /** Dashed Line Art Border */
  couponCutoutDashes = 'couponCutoutDashes',
  /** Dotted Line Art Border */
  couponCutoutDots = 'couponCutoutDots',
  /** Maze Art Border */
  crazyMaze = 'crazyMaze',
  /** Butterfly Art Border */
  creaturesButterfly = 'creaturesButterfly',
  /** Fish Art Border */
  creaturesFish = 'creaturesFish',
  /** Insects Art Border */
  creaturesInsects = 'creaturesInsects',
  /** Ladybug Art Border */
  creaturesLadyBug = 'creaturesLadyBug',
  /** Cross-stitch Art Border */
  crossStitch = 'crossStitch',
  /** Cupid Art Border */
  cup = 'cup',
  /** Archway Art Border */
  decoArch = 'decoArch',
  /** Color Archway Art Border */
  decoArchColor = 'decoArchColor',
  /** Blocks Art Border */
  decoBlocks = 'decoBlocks',
  /** Gray Diamond Art Border */
  diamondsGray = 'diamondsGray',
  /** Double D Art Border */
  doubleD = 'doubleD',
  /** Diamond Art Border */
  doubleDiamonds = 'doubleDiamonds',
  /** Earth Art Border */
  earth1 = 'earth1',
  /** Earth Art Border */
  earth2 = 'earth2',
  /** Shadowed Square Art Border */
  eclipsingSquares1 = 'eclipsingSquares1',
  /** Shadowed Square Art Border */
  eclipsingSquares2 = 'eclipsingSquares2',
  /** Painted Egg Art Border */
  eggsBlack = 'eggsBlack',
  /** Fans Art Border */
  fans = 'fans',
  /** Film Reel Art Border */
  film = 'film',
  /** Firecracker Art Border */
  firecrackers = 'firecrackers',
  /** Flowers Art Border */
  flowersBlockPrint = 'flowersBlockPrint',
  /** Daisy Art Border */
  flowersDaisies = 'flowersDaisies',
  /** Flowers Art Border */
  flowersModern1 = 'flowersModern1',
  /** Flowers Art Border */
  flowersModern2 = 'flowersModern2',
  /** Pansy Art Border */
  flowersPansy = 'flowersPansy',
  /** Red Rose Art Border */
  flowersRedRose = 'flowersRedRose',
  /** Roses Art Border */
  flowersRoses = 'flowersRoses',
  /** Flowers in a Teacup Art Border */
  flowersTeacup = 'flowersTeacup',
  /** Small Flower Art Border */
  flowersTiny = 'flowersTiny',
  /** Gems Art Border */
  gems = 'gems',
  /** Gingerbread Man Art Border */
  gingerbreadMan = 'gingerbreadMan',
  /** Triangle Gradient Art Border */
  gradient = 'gradient',
  /** Handmade Art Border */
  handmade1 = 'handmade1',
  /** Handmade Art Border */
  handmade2 = 'handmade2',
  /** Heart-Shaped Balloon Art Border */
  heartBalloon = 'heartBalloon',
  /** Gray Heart Art Border */
  heartGray = 'heartGray',
  /** Hearts Art Border */
  hearts = 'hearts',
  /** Pattern Art Border */
  heebieJeebies = 'heebieJeebies',
  /** Holly Art Border */
  holly = 'holly',
  /** House Art Border */
  houseFunky = 'houseFunky',
  /** Circular Art Border */
  hypnotic = 'hypnotic',
  /** Ice Cream Cone Art Border */
  iceCreamCones = 'iceCreamCones',
  /** Light Bulb Art Border */
  lightBulb = 'lightBulb',
  /** Lightning Art Border */
  lightning1 = 'lightning1',
  /** Lightning Art Border */
  lightning2 = 'lightning2',
  /** Map Pins Art Border */
  mapPins = 'mapPins',
  /** Maple Leaf Art Border */
  mapleLeaf = 'mapleLeaf',
  /** Muffin Art Border */
  mapleMuffins = 'mapleMuffins',
  /** Marquee Art Border */
  marquee = 'marquee',
  /** Marquee Art Border */
  marqueeToothed = 'marqueeToothed',
  /** Moon Art Border */
  moons = 'moons',
  /** Mosaic Art Border */
  mosaic = 'mosaic',
  /** Musical Note Art Border */
  musicNotes = 'musicNotes',
  /** Patterned Art Border */
  northwest = 'northwest',
  /** Oval Art Border */
  ovals = 'ovals',
  /** Package Art Border */
  packages = 'packages',
  /** Black Palm Tree Art Border */
  palmsBlack = 'palmsBlack',
  /** Color Palm Tree Art Border */
  palmsColor = 'palmsColor',
  /** Paper Clip Art Border */
  paperClips = 'paperClips',
  /** Papyrus Art Border */
  papyrus = 'papyrus',
  /** Party Favor Art Border */
  partyFavor = 'partyFavor',
  /** Party Glass Art Border */
  partyGlass = 'partyGlass',
  /** Pencils Art Border */
  pencils = 'pencils',
  /** Character Art Border */
  people = 'people',
  /** Waving Character Border */
  peopleWaving = 'peopleWaving',
  /** Character With Hat Art Border */
  peopleHats = 'peopleHats',
  /** Poinsettia Art Border */
  poinsettias = 'poinsettias',
  /** Postage Stamp Art Border */
  postageStamp = 'postageStamp',
  /** Pumpkin Art Border */
  pumpkin1 = 'pumpkin1',
  /** Push Pin Art Border */
  pushPinNote2 = 'pushPinNote2',
  /** Push Pin Art Border */
  pushPinNote1 = 'pushPinNote1',
  /** Pyramid Art Border */
  pyramids = 'pyramids',
  /** Pyramid Art Border */
  pyramidsAbove = 'pyramidsAbove',
  /** Quadrants Art Border */
  quadrants = 'quadrants',
  /** Rings Art Border */
  rings = 'rings',
  /** Safari Art Border */
  safari = 'safari',
  /** Saw tooth Art Border */
  sawtooth = 'sawtooth',
  /** Gray Saw tooth Art Border */
  sawtoothGray = 'sawtoothGray',
  /** Scared Cat Art Border */
  scaredCat = 'scaredCat',
  /** Umbrella Art Border */
  seattle = 'seattle',
  /** Shadowed Squares Art Border */
  shadowedSquares = 'shadowedSquares',
  /** Shark Tooth Art Border */
  sharksTeeth = 'sharksTeeth',
  /** Bird Tracks Art Border */
  shorebirdTracks = 'shorebirdTracks',
  /** Rocket Art Border */
  skyrocket = 'skyrocket',
  /** Snowflake Art Border */
  snowflakeFancy = 'snowflakeFancy',
  /** Snowflake Art Border */
  snowflakes = 'snowflakes',
  /** Sombrero Art Border */
  sombrero = 'sombrero',
  /** Southwest-themed Art Border */
  southwest = 'southwest',
  /** Stars Art Border */
  stars = 'stars',
  /** Stars On Top Art Border */
  starsTop = 'starsTop',
  /** 3-D Stars Art Border */
  stars3d = 'stars3d',
  /** Stars Art Border */
  starsBlack = 'starsBlack',
  /** Stars With Shadows Art Border */
  starsShadowed = 'starsShadowed',
  /** Sun Art Border */
  sun = 'sun',
  /** Whirligig Art Border */
  swirligig = 'swirligig',
  /** Torn Paper Art Border */
  tornPaper = 'tornPaper',
  /** Black Torn Paper Art Border */
  tornPaperBlack = 'tornPaperBlack',
  /** Tree Art Border */
  trees = 'trees',
  /** Triangle Art Border */
  triangleParty = 'triangleParty',
  /** Triangles Art Border */
  triangles = 'triangles',
  /** Tribal Art Border One */
  tribal1 = 'tribal1',
  /** Tribal Art Border Two */
  tribal2 = 'tribal2',
  /** Tribal Art Border Three */
  tribal3 = 'tribal3',
  /** Tribal Art Border Four */
  tribal4 = 'tribal4',
  /** Tribal Art Border Five */
  tribal5 = 'tribal5',
  /** Tribal Art Border Six */
  tribal6 = 'tribal6',
  /** Twisted Lines Art Border */
  twistedLines1 = 'twistedLines1',
  /** Twisted Lines Art Border */
  twistedLines2 = 'twistedLines2',
  /** Vine Art Border */
  vine = 'vine',
  /** Wavy Line Art Border */
  waveline = 'waveline',
  /** Weaving Angles Art Border */
  weavingAngles = 'weavingAngles',
  /** Weaving Braid Art Border */
  weavingBraid = 'weavingBraid',
  /** Weaving Ribbon Art Border */
  weavingRibbon = 'weavingRibbon',
  /** Weaving Strips Art Border */
  weavingStrips = 'weavingStrips',
  /** White Flowers Art Border */
  whiteFlowers = 'whiteFlowers',
  /** Woodwork Art Border */
  woodwork = 'woodwork',
  /** Crisscross Art Border */
  xIllusions = 'xIllusions',
  /** Triangle Art Border */
  zanyTriangles = 'zanyTriangles',
  /** Zigzag Art Border */
  zigZag = 'zigZag',
  /** Zigzag stitch */
  zigZagStitch = 'zigZagStitch',
}

/** Shading Patterns */
export enum ST_Shd {
  /** No Pattern */
  nil = 'nil',
  /** No Pattern */
  clear = 'clear',
  /** 100% Fill Pattern */
  solid = 'solid',
  /** Horizontal Stripe Pattern */
  horzStripe = 'horzStripe',
  /** Vertical Stripe Pattern */
  vertStripe = 'vertStripe',
  /** Reverse Diagonal Stripe Pattern */
  reverseDiagStripe = 'reverseDiagStripe',
  /** Diagonal Stripe Pattern */
  diagStripe = 'diagStripe',
  /** Horizontal Cross Pattern */
  horzCross = 'horzCross',
  /** Diagonal Cross Pattern */
  diagCross = 'diagCross',
  /** Thin Horizontal Stripe Pattern */
  thinHorzStripe = 'thinHorzStripe',
  /** Thin Vertical Stripe Pattern */
  thinVertStripe = 'thinVertStripe',
  /** Thin Reverse Diagonal Stripe Pattern */
  thinReverseDiagStripe = 'thinReverseDiagStripe',
  /** Thin Diagonal Stripe Pattern */
  thinDiagStripe = 'thinDiagStripe',
  /** Thin Horizontal Cross Pattern */
  thinHorzCross = 'thinHorzCross',
  /** Thin Diagonal Cross Pattern */
  thinDiagCross = 'thinDiagCross',
  /** 5% Fill Pattern */
  pct5 = 'pct5',
  /** 10% Fill Pattern */
  pct10 = 'pct10',
  /** 12.5% Fill Pattern */
  pct12 = 'pct12',
  /** 15% Fill Pattern */
  pct15 = 'pct15',
  /** 20% Fill Pattern */
  pct20 = 'pct20',
  /** 25% Fill Pattern */
  pct25 = 'pct25',
  /** 30% Fill Pattern */
  pct30 = 'pct30',
  /** 35% Fill Pattern */
  pct35 = 'pct35',
  /** 37.5% Fill Pattern */
  pct37 = 'pct37',
  /** 40% Fill Pattern */
  pct40 = 'pct40',
  /** 45% Fill Pattern */
  pct45 = 'pct45',
  /** 50% Fill Pattern */
  pct50 = 'pct50',
  /** 55% Fill Pattern */
  pct55 = 'pct55',
  /** 60% Fill Pattern */
  pct60 = 'pct60',
  /** 62.5% Fill Pattern */
  pct62 = 'pct62',
  /** 65% Fill Pattern */
  pct65 = 'pct65',
  /** 70% Fill Pattern */
  pct70 = 'pct70',
  /** 75% Fill Pattern */
  pct75 = 'pct75',
  /** 80% Fill Pattern */
  pct80 = 'pct80',
  /** 85% Fill Pattern */
  pct85 = 'pct85',
  /** 87.5% Fill Pattern */
  pct87 = 'pct87',
  /** 90% Fill Pattern */
  pct90 = 'pct90',
  /** 95% Fill Pattern */
  pct95 = 'pct95',
}

/** Vertical Positioning Location */
export enum ST_VerticalAlignRun {
  /** Regular Vertical Positioning */
  baseline = 'baseline',
  /** Superscript */
  superscript = 'superscript',
  /** Subscript */
  subscript = 'subscript',
}

/** Emphasis Mark Type */
export enum ST_Em {
  /** No Emphasis Mark */
  none = 'none',
  /** Dot Emphasis Mark Above Characters */
  dot = 'dot',
  /** Comma Emphasis Mark Above Characters */
  comma = 'comma',
  /** Circle Emphasis Mark Above Characters */
  circle = 'circle',
  /** Dot Emphasis Mark Below Characters */
  underDot = 'underDot',
}

/** Two Lines in One Enclosing Character Type */
export enum ST_CombineBrackets {
  /** No Enclosing Brackets */
  none = 'none',
  /** Round Brackets */
  round = 'round',
  /** Square Brackets */
  square = 'square',
  /** Angle Brackets */
  angle = 'angle',
  /** Curly Brackets */
  curly = 'curly',
}

/** Horizontal Alignment Location */
export enum ST_XAlign {
  /** Left Aligned Horizontally */
  left = 'left',
  /** Centered Horizontally */
  center = 'center',
  /** Right Aligned Horizontally */
  right = 'right',
  /** Inside */
  inside = 'inside',
  /** Outside */
  outside = 'outside',
}

/** Vertical Alignment Location */
export enum ST_YAlign {
  /** In line With Text */
  inline = 'inline',
  /** Top */
  top = 'top',
  /** Centered Vertically */
  center = 'center',
  /** Bottom */
  bottom = 'bottom',
  /** Inside Anchor Extents */
  inside = 'inside',
  /** Outside Anchor Extents */
  outside = 'outside',
}

/** Height Rule */
export enum ST_HeightRule {
  /** Determine Height Based On Contents */
  auto = 'auto',
  /** Exact Height */
  exact = 'exact',
  /** Minimum Height */
  atLeast = 'atLeast',
}

/** Text Wrapping around Text Frame Type */
export enum ST_Wrap {
  /** Default Text Wrapping Around Frame */
  auto = 'auto',
  /** No Text Wrapping Beside Frame */
  notBeside = 'notBeside',
  /** Allow Text Wrapping Around Frame */
  around = 'around',
  /** Tight Text Wrapping Around Frame */
  tight = 'tight',
  /** Through Text Wrapping Around Frame */
  through = 'through',
  /** No Text Wrapping Around Frame */
  none = 'none',
}

/** Vertical Anchor Location */
export enum ST_VAnchor {
  /** Relative To Vertical Text Extents */
  text = 'text',
  /** Relative To Margin */
  margin = 'margin',
  /** Relative To Page */
  page = 'page',
}

/** Horizontal Anchor Location */
export enum ST_HAnchor {
  /** Relative to Text Extents */
  text = 'text',
  /** Relative To Margin */
  margin = 'margin',
  /** Relative to Page */
  page = 'page',
}

/** Text Frame Drop Cap Location */
export enum ST_DropCap {
  /** Not Drop Cap */
  none = 'none',
  /** Drop Cap Inside Margin */
  drop = 'drop',
  /** Drop Cap Outside Margin */
  margin = 'margin',
}

/** Custom Tab Stop Type */
export enum ST_TabJc {
  /** No Tab Stop */
  clear = 'clear',
  /** Left Tab */
  left = 'left',
  /** Centered Tab */
  center = 'center',
  /** Right Tab */
  right = 'right',
  /** Decimal Tab */
  decimal = 'decimal',
  /** Bar Tab */
  bar = 'bar',
  /** List Tab */
  num = 'num',
}

/** Custom Tab Stop Leader Character */
export enum ST_TabTlc {
  /** No tab stop leader */
  none = 'none',
  /** Dotted leader line */
  dot = 'dot',
  /** Dashed tab stop leader line */
  hyphen = 'hyphen',
  /** Solid leader line */
  underscore = 'underscore',
  /** Heavy solid leader line */
  heavy = 'heavy',
  /** Middle dot leader line */
  middleDot = 'middleDot',
}

/** Line Spacing Rule */
export enum ST_LineSpacingRule {
  /** Automatically Determined Line Height */
  auto = 'auto',
  /** Exact Line Height */
  exact = 'exact',
  /** Minimum Line Height */
  atLeast = 'atLeast',
}

/** Horizontal Alignment Type */
export enum ST_Jc {
  /** Align Left */
  left = 'left',
  /** Align Center */
  center = 'center',
  /** Align Right */
  right = 'right',
  /** Justified */
  both = 'both',
  /** Medium Kashida Length */
  mediumKashida = 'mediumKashida',
  /** Distribute All Characters Equally */
  distribute = 'distribute',
  /** Align to List Tab */
  numTab = 'numTab',
  /** Widest Kashida Length */
  highKashida = 'highKashida',
  /** Low Kashida Length */
  lowKashida = 'lowKashida',
  /** Thai Language Justification */
  thaiDistribute = 'thaiDistribute',
}

/** Document View Values */
export enum ST_View {
  /** Default View */
  none = 'none',
  /** Print Layout View */
  print = 'print',
  /** Outline View */
  outline = 'outline',
  /** Master Document View */
  masterPages = 'masterPages',
  /** Draft View */
  normal = 'normal',
  /** Web Page View */
  web = 'web',
}

/** Magnification Preset Values */
export enum ST_Zoom {
  /** No Preset Magnification */
  none = 'none',
  /** Display One Full Page */
  fullPage = 'fullPage',
  /** Display Page Width */
  bestFit = 'bestFit',
  /** Display Text Width */
  textFit = 'textFit',
}

/** Proofing State Values */
export enum ST_Proof {
  /** Check Completed */
  clean = 'clean',
  /** Check Not Completed */
  dirty = 'dirty',
}

/** Document Classification Values */
export enum ST_DocType {
  /** Default Document */
  notSpecified = 'notSpecified',
  /** Letter */
  letter = 'letter',
  /** E-Mail Message */
  eMail = 'eMail',
}

/** Document Protection Types */
export enum ST_DocProtect {
  /** No Editing Restrictions */
  none = 'none',
  /** Allow No Editing */
  readOnly = 'readOnly',
  /** Allow Editing of Comments */
  comments = 'comments',
  /** Allow Editing With Revision Tracking */
  trackedChanges = 'trackedChanges',
  /** Allow Editing of Form Fields */
  forms = 'forms',
}

/** Cryptographic Provider Types */
export enum ST_CryptProv {
  /** AES Provider */
  rsaAES = 'rsaAES',
  /** Any Provider */
  rsaFull = 'rsaFull',
}

/** Cryptographic Algorithm Classes */
export enum ST_AlgClass {
  /** Hashing */
  hash = 'hash',
}

/** Cryptographic Algorithm Types */
export enum ST_AlgType {
  /** Any Type */
  typeAny = 'typeAny',
}

/** Source Document Types */
export enum ST_MailMergeDocType {
  /** Catalog Source Document */
  catalog = 'catalog',
  /** Envelope Source Document */
  envelopes = 'envelopes',
  /** Mailing Label Source Document */
  mailingLabels = 'mailingLabels',
  /** Form Letter Source Document */
  formLetters = 'formLetters',
  /** E-Mail Source Document */
  email = 'email',
  /** Fax Source Document */
  fax = 'fax',
}

/** Mail Merge Data Source Type Values */
export enum ST_MailMergeDataType {
  /** Text File Data Source */
  textFile = 'textFile',
  /** Database Data Source */
  database = 'database',
  /** Spreadsheet Data Source */
  spreadsheet = 'spreadsheet',
  /** Query Data Source */
  query = 'query',
  /** Open Database Connectivity Data Source */
  odbc = 'odbc',
  /** Office Data Source Object Data Source */
  native = 'native',
}

/** Merged Document Destination Types */
export enum ST_MailMergeDest {
  /** Send Merged Documents to New Documents */
  newDocument = 'newDocument',
  /** Send Merged Documents to Printer */
  printer = 'printer',
  /** Send Merged Documents as E-mail Messages */
  email = 'email',
  /** Send Merged Documents as Faxes */
  fax = 'fax',
}

/** Merge Field Mapping Types */
export enum ST_MailMergeOdsoFMDFieldType {
  /** Field Not Mapped */
  null = 'null',
  /** Field Mapping to Data Source Column */
  dbColumn = 'dbColumn',
}

/** Text Flow Direction */
export enum ST_TextDirection {
  /** Left to Right, Top to Bottom */
  lrTb = 'lrTb',
  /** Top to Bottom, Right to Left */
  tbRl = 'tbRl',
  /** Bottom to Top, Left to Right */
  btLr = 'btLr',
  /** Left to Right, Top to Bottom Rotated */
  lrTbV = 'lrTbV',
  /** Top to Bottom, Right to Left Rotated */
  tbRlV = 'tbRlV',
  /** Top to Bottom, Left to Right Rotated */
  tbLrV = 'tbLrV',
}

/** Vertical Text Alignment Types */
export enum ST_TextAlignment {
  /** Align Text at Top */
  top = 'top',
  /** Align Text at Center */
  center = 'center',
  /** Align Text at Baseline */
  baseline = 'baseline',
  /** Align Text at Bottom */
  bottom = 'bottom',
  /** Automatically Determine Alignment */
  auto = 'auto',
}

/** Location of Custom XML Markup Displacing an Annotation */
export enum ST_DisplacedByCustomXml {
  /** Displaced by Next Custom XML Markup Tag */
  next = 'next',
  /** Displaced by Previous Custom XML Markup Tag */
  prev = 'prev',
}

/** Table Cell Vertical Merge Revision Type */
export enum ST_AnnotationVMerge {
  /** Vertically Merged Cell */
  cont = 'cont',
  /** Vertically Split Cell */
  rest = 'rest',
}

/** Lines To Tight Wrap Within Text Box */
export enum ST_TextboxTightWrap {
  /** Do Not Tight Wrap */
  none = 'none',
  /** Tight Wrap All Lines */
  allLines = 'allLines',
  /** Tight Wrap First and Last Lines */
  firstAndLastLine = 'firstAndLastLine',
  /** Tight Wrap First Line */
  firstLineOnly = 'firstLineOnly',
  /** Tight Wrap Last Line */
  lastLineOnly = 'lastLineOnly',
}

/** Complex Field Character Type */
export enum ST_FldCharType {
  /** Start Character */
  begin = 'begin',
  /** Separator Character */
  separate = 'separate',
  /** End Character */
  end = 'end',
}

/** Help or Status Text Type */
export enum ST_InfoTextType {
  /** Literal Text */
  text = 'text',
  /** Glossary Document Entry */
  autoText = 'autoText',
}

/** Help Text Value */
export type ST_FFHelpTextVal = string;

/** Status Text Value */
export type ST_FFStatusTextVal = string;

/** Form Field Name Value */
export type ST_FFName = string;

/** Text Box Form Field Type Values */
export enum ST_FFTextType {
  /** Text Box */
  regular = 'regular',
  /** Number */
  number = 'number',
  /** Date */
  date = 'date',
  /** Current Time Display */
  currentTime = 'currentTime',
  /** Current Date Display */
  currentDate = 'currentDate',
  /** Field Calculation */
  calculated = 'calculated',
}

/** Section Type */
export enum ST_SectionMark {
  /** Next Page Section Break */
  nextPage = 'nextPage',
  /** Column Section Break */
  nextColumn = 'nextColumn',
  /** Continuous Section Break */
  continuous = 'continuous',
  /** Even Page Section Break */
  evenPage = 'evenPage',
  /** Odd Page Section Break */
  oddPage = 'oddPage',
}

/** Numbering Format */
export enum ST_NumberFormat {
  /** Decimal Numbers */
  decimal = 'decimal',
  /** Uppercase Roman Numerals */
  upperRoman = 'upperRoman',
  /** Lowercase Roman Numerals */
  lowerRoman = 'lowerRoman',
  /** Uppercase Latin Alphabet */
  upperLetter = 'upperLetter',
  /** Lowercase Latin Alphabet */
  lowerLetter = 'lowerLetter',
  /** Ordinal */
  ordinal = 'ordinal',
  /** Cardinal Text */
  cardinalText = 'cardinalText',
  /** Ordinal Text */
  ordinalText = 'ordinalText',
  /** Hexadecimal Numbering */
  hex = 'hex',
  /** Chicago Manual of Style */
  chicago = 'chicago',
  /** Ideographs */
  ideographDigital = 'ideographDigital',
  /** Japanese Counting System */
  japaneseCounting = 'japaneseCounting',
  /** AIUEO Order Hiragana */
  aiueo = 'aiueo',
  /** Iroha Ordered Katakana */
  iroha = 'iroha',
  /** Double Byte Arabic Numerals */
  decimalFullWidth = 'decimalFullWidth',
  /** Single Byte Arabic Numerals */
  decimalHalfWidth = 'decimalHalfWidth',
  /** Japanese Legal Numbering */
  japaneseLegal = 'japaneseLegal',
  /** Japanese Digital Ten Thousand Counting System */
  japaneseDigitalTenThousand = 'japaneseDigitalTenThousand',
  /** Decimal Numbers Enclosed in a Circle */
  decimalEnclosedCircle = 'decimalEnclosedCircle',
  /** Double Byte Arabic Numerals Alternate */
  decimalFullWidth2 = 'decimalFullWidth2',
  /** Full-Width AIUEO Order Hiragana */
  aiueoFullWidth = 'aiueoFullWidth',
  /** Full-Width Iroha Ordered Katakana */
  irohaFullWidth = 'irohaFullWidth',
  /** Initial Zero Arabic Numerals */
  decimalZero = 'decimalZero',
  /** Bullet */
  bullet = 'bullet',
  /** Korean Ganada Numbering */
  ganada = 'ganada',
  /** Korean Chosung Numbering */
  chosung = 'chosung',
  /** Decimal Numbers Followed by a Period */
  decimalEnclosedFullstop = 'decimalEnclosedFullstop',
  /** Decimal Numbers Enclosed in Parenthesis */
  decimalEnclosedParen = 'decimalEnclosedParen',
  /** Decimal Numbers Enclosed in a Circle */
  decimalEnclosedCircleChinese = 'decimalEnclosedCircleChinese',
  /** Ideographs Enclosed in a Circle */
  ideographEnclosedCircle = 'ideographEnclosedCircle',
  /** Traditional Ideograph Format */
  ideographTraditional = 'ideographTraditional',
  /** Zodiac Ideograph Format */
  ideographZodiac = 'ideographZodiac',
  /** Traditional Zodiac Ideograph Format */
  ideographZodiacTraditional = 'ideographZodiacTraditional',
  /** Taiwanese Counting System */
  taiwaneseCounting = 'taiwaneseCounting',
  /** Traditional Legal Ideograph Format */
  ideographLegalTraditional = 'ideographLegalTraditional',
  /** Taiwanese Counting Thousand System */
  taiwaneseCountingThousand = 'taiwaneseCountingThousand',
  /** Taiwanese Digital Counting System */
  taiwaneseDigital = 'taiwaneseDigital',
  /** Chinese Counting System */
  chineseCounting = 'chineseCounting',
  /** Chinese Legal Simplified Format */
  chineseLegalSimplified = 'chineseLegalSimplified',
  /** Chinese Counting Thousand System */
  chineseCountingThousand = 'chineseCountingThousand',
  /** Korean Digital Counting System */
  koreanDigital = 'koreanDigital',
  /** Korean Counting System */
  koreanCounting = 'koreanCounting',
  /** Korean Legal Numbering */
  koreanLegal = 'koreanLegal',
  /** Korean Digital Counting System Alternate */
  koreanDigital2 = 'koreanDigital2',
  /** Vietnamese Numerals */
  vietnameseCounting = 'vietnameseCounting',
  /** Lowercase Russian Alphabet */
  russianLower = 'russianLower',
  /** Uppercase Russian Alphabet */
  russianUpper = 'russianUpper',
  /** No Numbering */
  none = 'none',
  /** Number With Dashes */
  numberInDash = 'numberInDash',
  /** Hebrew Numerals */
  hebrew1 = 'hebrew1',
  /** Hebrew Alphabet */
  hebrew2 = 'hebrew2',
  /** Arabic Alphabet */
  arabicAlpha = 'arabicAlpha',
  /** Arabic Abjad Numerals */
  arabicAbjad = 'arabicAbjad',
  /** Hindi Vowels */
  hindiVowels = 'hindiVowels',
  /** Hindi Consonants */
  hindiConsonants = 'hindiConsonants',
  /** Hindi Numbers */
  hindiNumbers = 'hindiNumbers',
  /** Hindi Counting System */
  hindiCounting = 'hindiCounting',
  /** Thai Letters */
  thaiLetters = 'thaiLetters',
  /** Thai Numerals */
  thaiNumbers = 'thaiNumbers',
  /** Thai Counting System */
  thaiCounting = 'thaiCounting',
}

/** Page Orientation */
export enum ST_PageOrientation {
  /** Portrait Mode */
  portrait = 'portrait',
  /** Landscape Mode */
  landscape = 'landscape',
}

/** Page Border Z-Order */
export enum ST_PageBorderZOrder {
  /** Page Border Ahead of Text */
  front = 'front',
  /** Page Border Behind Text */
  back = 'back',
}

/** Page Border Display Options */
export enum ST_PageBorderDisplay {
  /** Display Page Border on All Pages */
  allPages = 'allPages',
  /** Display Page Border on First Page */
  firstPage = 'firstPage',
  /** Display Page Border on All Pages Except First */
  notFirstPage = 'notFirstPage',
}

/** Page Border Positioning Base */
export enum ST_PageBorderOffset {
  /** Page Border Is Positioned Relative to Page Edges */
  page = 'page',
  /** Page Border Is Positioned Relative to Text Extents */
  text = 'text',
}

/** Chapter Separator Types */
export enum ST_ChapterSep {
  /** Hyphen Chapter Separator */
  hyphen = 'hyphen',
  /** Period Chapter Separator */
  period = 'period',
  /** Colon Chapter Separator */
  colon = 'colon',
  /** Em Dash Chapter Separator */
  emDash = 'emDash',
  /** En Dash Chapter Separator */
  enDash = 'enDash',
}

/** Line Numbering Restart Position */
export enum ST_LineNumberRestart {
  /** Restart Line Numbering on Each Page */
  newPage = 'newPage',
  /** Restart Line Numbering for Each Section */
  newSection = 'newSection',
  /** Continue Line Numbering From Previous Section */
  continuous = 'continuous',
}

/** Vertical Alignment Type */
export enum ST_VerticalJc {
  /** Align Top */
  top = 'top',
  /** Align Center */
  center = 'center',
  /** Vertical Justification */
  both = 'both',
  /** Align Bottom */
  bottom = 'bottom',
}

/** Document Grid Types */
export enum ST_DocGrid {
  /** No Document Grid */
  default = 'default',
  /** Line Grid Only */
  lines = 'lines',
  /** Line and Character Grid */
  linesAndChars = 'linesAndChars',
  /** Character Grid Only */
  snapToChars = 'snapToChars',
}

/** Header or Footer Type */
export enum ST_HdrFtr {
  /** Even Numbered Pages Only */
  even = 'even',
  /** Default Header or Footer */
  default = 'default',
  /** First Page Only */
  first = 'first',
}

/** Footnote or Endnote Type */
export enum ST_FtnEdn {
  /** Normal Footnote/Endnote */
  normal = 'normal',
  /** Separator */
  separator = 'separator',
  /** Continuation Separator */
  continuationSeparator = 'continuationSeparator',
  /** Continuation Notice Separator */
  continuationNotice = 'continuationNotice',
}

/** Break Types */
export enum ST_BrType {
  /** Page Break */
  page = 'page',
  /** Column Break */
  column = 'column',
  /** Line Break */
  textWrapping = 'textWrapping',
}

/** Line Break Text Wrapping Restart Location */
export enum ST_BrClear {
  /** Restart On Next Line */
  none = 'none',
  /** Restart In Next Text Region When In Leftmost Position */
  left = 'left',
  /** Restart In Next Text Region When In Rightmost Position */
  right = 'right',
  /** Restart On Next Full Line */
  all = 'all',
}

/** Absolute Position Tab Alignment */
export enum ST_PTabAlignment {
  /** Left */
  left = 'left',
  /** Center */
  center = 'center',
  /** Right */
  right = 'right',
}

/** Absolute Position Tab Positioning Base */
export enum ST_PTabRelativeTo {
  /** Relative To Text Margins */
  margin = 'margin',
  /** Relative To Indents */
  indent = 'indent',
}

/** Absolute Position Tab Leader Character */
export enum ST_PTabLeader {
  /** No Leader Character */
  none = 'none',
  /** Dot Leader Character */
  dot = 'dot',
  /** Hyphen Leader Character */
  hyphen = 'hyphen',
  /** Underscore Leader Character */
  underscore = 'underscore',
  /** Centered Dot Leader Character */
  middleDot = 'middleDot',
}

/** Proofing Error Type */
export enum ST_ProofErr {
  /** Start of Region Marked as Spelling Error */
  spellStart = 'spellStart',
  /** End of Region Marked as Spelling Error */
  spellEnd = 'spellEnd',
  /** Start of Region Marked as Grammatical Error */
  gramStart = 'gramStart',
  /** End of Region Marked as Grammatical Error */
  gramEnd = 'gramEnd',
}

/** Range Permision Editing Group */
export enum ST_EdGrp {
  /** No Users Have Editing Permissions */
  none = 'none',
  /** All Users Have Editing Permissions */
  everyone = 'everyone',
  /** Administrator Group */
  administrators = 'administrators',
  /** Contributors Group */
  contributors = 'contributors',
  /** Editors Group */
  editors = 'editors',
  /** Owners Group */
  owners = 'owners',
  /** Current Group */
  current = 'current',
}

/** Font Type Hint */
export enum ST_Hint {
  /** High ANSI Font */
  default = 'default',
  /** East Asian Font */
  eastAsia = 'eastAsia',
  /** Complex Script Font */
  cs = 'cs',
}

/** Theme Font */
export enum ST_Theme {
  /** Major East Asian Theme Font */
  majorEastAsia = 'majorEastAsia',
  /** Major Complex Script Theme Font */
  majorBidi = 'majorBidi',
  /** Major ASCII Theme Font */
  majorAscii = 'majorAscii',
  /** Major High ANSI Theme Font */
  majorHAnsi = 'majorHAnsi',
  /** Minor East Asian Theme Font */
  minorEastAsia = 'minorEastAsia',
  /** Minor Complex Script Theme Font */
  minorBidi = 'minorBidi',
  /** Minor ASCII Theme Font */
  minorAscii = 'minorAscii',
  /** Minor High ANSI Theme Font */
  minorHAnsi = 'minorHAnsi',
}

/** Phonetic Guide Text Alignment */
export enum ST_RubyAlign {
  /** Center */
  center = 'center',
  /** Distribute All Characters */
  distributeLetter = 'distributeLetter',
  /** Distribute all Characters w/ Additional Space On Either Side */
  distributeSpace = 'distributeSpace',
  /** Left Aligned */
  left = 'left',
  /** Right Aligned */
  right = 'right',
  /** Vertically Aligned to Right of Base Text */
  rightVertical = 'rightVertical',
}

/** Locking Types */
export enum ST_Lock {
  /** SDT Cannot Be Deleted */
  sdtLocked = 'sdtLocked',
  /** Contents Cannot Be Edited At Runtime */
  contentLocked = 'contentLocked',
  /** No Locking */
  unlocked = 'unlocked',
  /** Contents Cannot Be Edited At Runtime And SDT Cannot Be Deleted */
  sdtContentLocked = 'sdtContentLocked',
}

/** Date Storage Format Types */
export enum ST_SdtDateMappingType {
  /** Same As Display */
  text = 'text',
  /** XML Schema Date Format */
  date = 'date',
  /** XML Schema DateTime Format */
  dateTime = 'dateTime',
}

/** Calendar Types */
export enum ST_CalendarType {
  /** Gregorian */
  gregorian = 'gregorian',
  /** Hijri */
  hijri = 'hijri',
  /** Hebrew */
  hebrew = 'hebrew',
  /** Taiwan */
  taiwan = 'taiwan',
  /** Japanese Emperor Era */
  japan = 'japan',
  /** Thai */
  thai = 'thai',
  /** Korean Tangun Era */
  korea = 'korea',
  /** Saka Era */
  saka = 'saka',
  /** Gregorian transliterated English */
  gregorianXlitEnglish = 'gregorianXlitEnglish',
  /** Gregorian transliterated French */
  gregorianXlitFrench = 'gregorianXlitFrench',
}

/** Table Width Units */
export enum ST_TblWidth {
  /** No Width */
  nil = 'nil',
  /** Width in Fiftieths of a Percent */
  pct = 'pct',
  /** Width in Twentieths of a Point */
  dxa = 'dxa',
  /** Automatically Determined Width */
  auto = 'auto',
}

/** Merged Cell Type */
export enum ST_Merge {
  /** Continue Merged Region */
  continue = 'continue',
  /** Start/Restart Merged Region */
  restart = 'restart',
}

/** Conditional Formatting Bitmask */
export type ST_Cnf = string;

/** Table Layout Type */
export enum ST_TblLayoutType {
  /** Fixed Width Table Layout */
  fixed = 'fixed',
  /** AutoFit Table Layout */
  autofit = 'autofit',
}

/** Table Overlap Setting */
export enum ST_TblOverlap {
  /** Floating Table Cannot Overlap */
  never = 'never',
  /** Floating Table Can Overlap */
  overlap = 'overlap',
}

/** Footnote Positioning Location */
export enum ST_FtnPos {
  /** Footnotes Positioned at Page Bottom */
  pageBottom = 'pageBottom',
  /** Footnotes Positioned Beneath Text */
  beneathText = 'beneathText',
  /** Footnotes Positioned At End of Section */
  sectEnd = 'sectEnd',
  /** Footnotes Positioned At End of Document */
  docEnd = 'docEnd',
}

/** Endnote Positioning Location */
export enum ST_EdnPos {
  /** Endnotes Positioned at End of Section */
  sectEnd = 'sectEnd',
  /** Endnotes Positioned at End of Document */
  docEnd = 'docEnd',
}

/** Footnote/Endnote Numbering Restart Locations */
export enum ST_RestartNumber {
  /** Continue Numbering From Previous Section */
  continuous = 'continuous',
  /** Restart Numbering For Each Section */
  eachSect = 'eachSect',
  /** Restart Numbering On Each Page */
  eachPage = 'eachPage',
}

/** Mail Merge ODSO Data Source Types */
export enum ST_MailMergeSourceType {
  /** Database Data Source */
  database = 'database',
  /** Address Book Data Source */
  addressBook = 'addressBook',
  /** Alternate Document Format Data Source */
  document1 = 'document1',
  /** Alternate Document Format Data Source Two */
  document2 = 'document2',
  /** Text File Data Source */
  text = 'text',
  /** E-Mail Program Data Source */
  email = 'email',
  /** Native Data Souce */
  native = 'native',
  /** Legacy Document Format Data Source */
  legacy = 'legacy',
  /** Aggregate Data Source */
  master = 'master',
}

/** Target Screen Sizes for Generated Web Pages */
export enum ST_TargetScreenSz {
  /** Optimize for 544x376 */
  _544x376 = '544x376',
  /** Optimize for 640x480 */
  _640x480 = '640x480',
  /** Optimize for 720x512 */
  _720x512 = '720x512',
  /** Optimize for 800x600 */
  _800x600 = '800x600',
  /** Optimize for 1024x768 */
  _1024x768 = '1024x768',
  /** Optimize for 1152x882 */
  _1152x882 = '1152x882',
  /** Optimize for 1152x900 */
  _1152x900 = '1152x900',
  /** Optimize for 1280x1024 */
  _1280x1024 = '1280x1024',
  /** Optimize for 1600x1200 */
  _1600x1200 = '1600x1200',
  /** Optimize for 1800x1440 */
  _1800x1440 = '1800x1440',
  /** Optimize for 1920x1200 */
  _1920x1200 = '1920x1200',
}

/** Character-Level Whitespace Compression Settings */
export enum ST_CharacterSpacing {
  /** Do Not Compress Whitespace */
  doNotCompress = 'doNotCompress',
  /** Compress Whitespace From Punctuation Characters */
  compressPunctuation = 'compressPunctuation',
  /** Compress Whitespace From Both Japanese Kana And Punctuation Characters */
  compressPunctuationAndJapaneseKana = 'compressPunctuationAndJapaneseKana',
}

/** Theme Color Reference */
export enum ST_ColorSchemeIndex {
  /** Dark 1 Theme Color Reference */
  dark1 = 'dark1',
  /** Light 1 Theme Color Reference */
  light1 = 'light1',
  /** Dark 2 Theme Color Reference */
  dark2 = 'dark2',
  /** Light 2 Theme Color Reference */
  light2 = 'light2',
  /** Accent 1 Theme Color Reference */
  accent1 = 'accent1',
  /** Accent 2 Theme Color Reference */
  accent2 = 'accent2',
  /** Accent 3 Theme Color Reference */
  accent3 = 'accent3',
  /** Accent4 Theme Color Reference */
  accent4 = 'accent4',
  /** Accent5 Theme Color Reference */
  accent5 = 'accent5',
  /** Accent 6 Theme Color Reference */
  accent6 = 'accent6',
  /** Hyperlink Theme Color Reference */
  hyperlink = 'hyperlink',
  /** Followed Hyperlink Theme Color Reference */
  followedHyperlink = 'followedHyperlink',
}

/** Frame Scrollbar Visibility */
export enum ST_FrameScrollbar {
  /** Always Show Scrollbar */
  on = 'on',
  /** Never Show Scrollbar */
  off = 'off',
  /** Automatically Show Scrollbar As Needed */
  auto = 'auto',
}

/** Frameset Layout Order */
export enum ST_FrameLayout {
  /** Stack Frames Vertically */
  rows = 'rows',
  /** Stack Frames Horizontally */
  cols = 'cols',
  /** Do Not Stack Frames */
  none = 'none',
}

/** Content Between Numbering Symbol and Paragraph Text */
export enum ST_LevelSuffix {
  /** Tab Between Numbering and Text */
  tab = 'tab',
  /** Space Between Numbering and Text */
  space = 'space',
  /** Nothing Between Numbering and Text */
  nothing = 'nothing',
}

/** Numbering Definition Type */
export enum ST_MultiLevelType {
  /** Single Level Numbering Definition */
  singleLevel = 'singleLevel',
  /** Multilevel Numbering Definition */
  multilevel = 'multilevel',
  /** Hybrid Multilevel Numbering Definition */
  hybridMultilevel = 'hybridMultilevel',
}

/** Conditional Table Style Formatting Types */
export enum ST_TblStyleOverrideType {
  /** Whole table formatting */
  wholeTable = 'wholeTable',
  /** First Row Conditional Formatting */
  firstRow = 'firstRow',
  /** Last table row formatting */
  lastRow = 'lastRow',
  /** First Column Conditional Formatting */
  firstCol = 'firstCol',
  /** Last table column formatting */
  lastCol = 'lastCol',
  /** Banded Column Conditional Formatting */
  band1Vert = 'band1Vert',
  /** Even Column Stripe Conditional Formatting */
  band2Vert = 'band2Vert',
  /** Banded Row Conditional Formatting */
  band1Horz = 'band1Horz',
  /** Even Row Stripe Conditional Formatting */
  band2Horz = 'band2Horz',
  /** Top right table cell formatting */
  neCell = 'neCell',
  /** Top left table cell formatting */
  nwCell = 'nwCell',
  /** Bottom right table cell formatting */
  seCell = 'seCell',
  /** Bottom left table cell formatting */
  swCell = 'swCell',
}

/** Style Types */
export enum ST_StyleType {
  /** Paragraph Style */
  paragraph = 'paragraph',
  /** Character Style */
  character = 'character',
  /** Table Style */
  table = 'table',
  /** Numbering Style */
  numbering = 'numbering',
}

/** Panose-1 Number */

/** Font Family Value */
export enum ST_FontFamily {
  /** Novelty Font */
  decorative = 'decorative',
  /** Monospace Font */
  modern = 'modern',
  /** Proportional Font With Serifs */
  roman = 'roman',
  /** Script Font */
  script = 'script',
  /** Proportional Font Without Serifs */
  swiss = 'swiss',
  /** No Font Family */
  auto = 'auto',
}

/** Font Pitch Value */
export enum ST_Pitch {
  /** Fixed Width */
  fixed = 'fixed',
  /** Proportional Width */
  variable = 'variable',
  /** Default */
  default = 'default',
}

/** Theme Color */
export enum ST_ThemeColor {
  /** Dark 1 Theme Color */
  dark1 = 'dark1',
  /** Light 1 Theme Color */
  light1 = 'light1',
  /** Dark 2 Theme Color */
  dark2 = 'dark2',
  /** Light 2 Theme Color */
  light2 = 'light2',
  /** Accent 1 Theme Color */
  accent1 = 'accent1',
  /** Accent 2 Theme Color */
  accent2 = 'accent2',
  /** Accent 3 Theme Color */
  accent3 = 'accent3',
  /** Accent 4 Theme Color */
  accent4 = 'accent4',
  /** Accent 5 Theme Color */
  accent5 = 'accent5',
  /** Accent 6 Theme Color */
  accent6 = 'accent6',
  /** Hyperlink Theme Color */
  hyperlink = 'hyperlink',
  /** Followed Hyperlink Theme Color */
  followedHyperlink = 'followedHyperlink',
  /** No Theme Color */
  none = 'none',
  /** Background 1 Theme Color */
  background1 = 'background1',
  /** Text 1 Theme Color */
  text1 = 'text1',
  /** Background 2 Theme Color */
  background2 = 'background2',
  /** Text 2 Theme Color */
  text2 = 'text2',
}

/** Insertion Behavior Types */
export enum ST_DocPartBehavior {
  /** Insert Content At Specified Location */
  content = 'content',
  /** Ensure Entry Is In New Paragraph */
  p = 'p',
  /** Ensure Entry Is On New Page */
  pg = 'pg',
}

/** Entry Types */
export enum ST_DocPartType {
  /** No Type */
  none = 'none',
  /** Normal */
  normal = 'normal',
  /** Automatically Replace Name With Content */
  autoExp = 'autoExp',
  /** AutoText User Interface Entry */
  toolbar = 'toolbar',
  /** AutoCorrect Entry */
  speller = 'speller',
  /** Form Field Help Text */
  formFld = 'formFld',
  /** Structured Document Tag Placeholder Text */
  bbPlcHdr = 'bbPlcHdr',
}

/** Entry Gallery Types */
export enum ST_DocPartGallery {
  /** Structured Document Tag Placeholder Text Gallery */
  placeholder = 'placeholder',
  /** All Galleries */
  any = 'any',
  /** No Gallery Classification */
  default = 'default',
  /** Document Parts Gallery */
  docParts = 'docParts',
  /** Cover Page Gallery */
  coverPg = 'coverPg',
  /** Equations Gallery */
  eq = 'eq',
  /** Footers Gallery */
  ftrs = 'ftrs',
  /** Headers Gallery */
  hdrs = 'hdrs',
  /** Page Numbers Gallery */
  pgNum = 'pgNum',
  /** Table Gallery */
  tbls = 'tbls',
  /** Watermark Gallery */
  watermarks = 'watermarks',
  /** AutoText Gallery */
  autoTxt = 'autoTxt',
  /** Text Box Gallery */
  txtBox = 'txtBox',
  /** Page Numbers At Top Gallery */
  pgNumT = 'pgNumT',
  /** Page Numbers At Bottom Gallery */
  pgNumB = 'pgNumB',
  /** Page Numbers At Margins Gallery */
  pgNumMargins = 'pgNumMargins',
  /** Table of Contents Gallery */
  tblOfContents = 'tblOfContents',
  /** Bibliography Gallery */
  bib = 'bib',
  /** Custom Quick Parts Gallery */
  custQuickParts = 'custQuickParts',
  /** Custom Cover Page Gallery */
  custCoverPg = 'custCoverPg',
  /** Custom Equation Gallery */
  custEq = 'custEq',
  /** Custom Footer Gallery */
  custFtrs = 'custFtrs',
  /** Custom Header Gallery */
  custHdrs = 'custHdrs',
  /** Custom Page Number Gallery */
  custPgNum = 'custPgNum',
  /** Custom Table Gallery */
  custTbls = 'custTbls',
  /** Custom Watermark Gallery */
  custWatermarks = 'custWatermarks',
  /** Custom AutoText Gallery */
  custAutoTxt = 'custAutoTxt',
  /** Custom Text Box Gallery */
  custTxtBox = 'custTxtBox',
  /** Custom Page Number At Top Gallery */
  custPgNumT = 'custPgNumT',
  /** Custom Page Number At Bottom Gallery */
  custPgNumB = 'custPgNumB',
  /** Custom Page Number At Margins Gallery */
  custPgNumMargins = 'custPgNumMargins',
  /** Custom Table of Contents Gallery */
  custTblOfContents = 'custTblOfContents',
  /** Custom Bibliography Gallery */
  custBib = 'custBib',
  /** Custom 1 Gallery */
  custom1 = 'custom1',
  /** Custom 2 Gallery */
  custom2 = 'custom2',
  /** Custom 3 Gallery */
  custom3 = 'custom3',
  /** Custom 4 Gallery */
  custom4 = 'custom4',
  /** Custom 5 Gallery */
  custom5 = 'custom5',
}

/** Automatic Caption Positioning Values */
export enum ST_CaptionPos {
  /** Position Caption Above Object */
  above = 'above',
  /** Position Caption Below Object */
  below = 'below',
  /** Position Caption Left Of Object */
  left = 'left',
  /** Position Caption Right Of Object */
  right = 'right',
}

/** On/Off Value */
export interface CT_OnOff {
  val?: ST_OnOff;
}

/** Long Hexadecimal Number Value */
export interface CT_LongHexNumber {
  val: ST_LongHexNumber;
}

/** Two Digit Hexadecimal Value */
export interface CT_ShortHexNumber {
  val: ST_ShortHexNumber;
}

/** Value */
export interface CT_UcharHexNumber {
  val: ST_UcharHexNumber;
}

/** Decimal Number Value */
export interface CT_DecimalNumber {
  val: ST_DecimalNumber;
}

/** Positive or Negative Value in Twentieths of a Point */
export interface CT_SignedTwipsMeasure {
  val: ST_SignedTwipsMeasure;
}

/** Measurement in Pixels */
export interface CT_PixelsMeasure {
  val: ST_PixelsMeasure;
}

/** Half Point Measurement */
export interface CT_HpsMeasure {
  val: ST_HpsMeasure;
}

/** Signed Half-Point Measurement */
export interface CT_SignedHpsMeasure {
  val: ST_SignedHpsMeasure;
}

/** Name of Script Function */
export interface CT_MacroName {
  val?: any;
}

/** String Value */
export interface CT_String {
  val: ST_String;
}

/** Text Expansion/Compression Value */
export interface CT_TextScale {
  val?: ST_TextScale;
}

/** Highlighting Color */
export interface CT_Highlight {
  val: ST_HighlightColor;
}

/** Run Content Color */
export interface CT_Color {
  val: ST_HexColor;
  themeColor?: ST_ThemeColor;
  themeTint?: ST_UcharHexNumber;
  themeShade?: ST_UcharHexNumber;
}

/** Language Code */
export interface CT_Lang {
  val: ST_Lang;
}

/** GUID Value */
export interface CT_Guid {
  val?: ST_Guid;
}

/** Underline Style */
export interface CT_Underline {
  val?: ST_Underline;
  color?: ST_HexColor;
  themeColor?: ST_ThemeColor;
  themeTint?: ST_UcharHexNumber;
  themeShade?: ST_UcharHexNumber;
}

/** Animated Text Effect Type */
export interface CT_TextEffect {
  val: ST_TextEffect;
}

/** Border Style */
export interface CT_Border {
  val: ST_Border;
  color?: ST_HexColor;
  themeColor?: ST_ThemeColor;
  themeTint?: ST_UcharHexNumber;
  themeShade?: ST_UcharHexNumber;
  sz?: ST_EighthPointMeasure;
  space?: ST_PointMeasure;
  shadow?: ST_OnOff;
  frame?: ST_OnOff;
}

/** Shading Pattern */
export interface CT_Shd {
  val: ST_Shd;
  color?: ST_HexColor;
  themeColor?: ST_ThemeColor;
  themeTint?: ST_UcharHexNumber;
  themeShade?: ST_UcharHexNumber;
  fill?: ST_HexColor;
  themeFill?: ST_ThemeColor;
  themeFillTint?: ST_UcharHexNumber;
  themeFillShade?: ST_UcharHexNumber;
}

/** Subscript/Superscript Value */
export interface CT_VerticalAlignRun {
  val: ST_VerticalAlignRun;
}

/** Value */
export interface CT_FitText {
  val: ST_TwipsMeasure;
  id?: ST_DecimalNumber;
}

/** Emphasis Mark Type */
export interface CT_Em {
  val: ST_Em;
}

/** Latin Language */
export interface CT_Language {
  val?: ST_Lang;
  eastAsia?: ST_Lang;
  bidi?: ST_Lang;
}

/** East Asian Typography Run ID */
export interface CT_EastAsianLayout {
  id?: ST_DecimalNumber;
  combine?: ST_OnOff;
  combineBrackets?: ST_CombineBrackets;
  vert?: ST_OnOff;
  vertCompress?: ST_OnOff;
}

/** Drop Cap Frame */
export interface CT_FramePr {
  dropCap?: ST_DropCap;
  lines?: ST_DecimalNumber;
  w?: ST_TwipsMeasure;
  h?: ST_TwipsMeasure;
  vSpace?: ST_TwipsMeasure;
  hSpace?: ST_TwipsMeasure;
  wrap?: ST_Wrap;
  hAnchor?: ST_HAnchor;
  vAnchor?: ST_VAnchor;
  x?: ST_SignedTwipsMeasure;
  xAlign?: ST_XAlign;
  y?: ST_SignedTwipsMeasure;
  yAlign?: ST_YAlign;
  hRule?: ST_HeightRule;
  anchorLock?: ST_OnOff;
}

/** Tab Stop Type */
export interface CT_TabStop {
  val: ST_TabJc;
  leader?: ST_TabTlc;
  pos: ST_SignedTwipsMeasure;
}

/** Spacing Above Paragraph */
export interface CT_Spacing {
  before?: ST_TwipsMeasure;
  beforeLines?: ST_DecimalNumber;
  beforeAutospacing?: ST_OnOff;
  after?: ST_TwipsMeasure;
  afterLines?: ST_DecimalNumber;
  afterAutospacing?: ST_OnOff;
  line?: ST_SignedTwipsMeasure;
  lineRule?: ST_LineSpacingRule;
}

/** Left Indentation */
export interface CT_Ind {
  left?: ST_SignedTwipsMeasure;
  leftChars?: ST_DecimalNumber;
  right?: ST_SignedTwipsMeasure;
  rightChars?: ST_DecimalNumber;
  hanging?: ST_TwipsMeasure;
  hangingChars?: ST_DecimalNumber;
  firstLine?: ST_TwipsMeasure;
  firstLineChars?: ST_DecimalNumber;
}

/** Alignment Type */
export interface CT_Jc {
  val: ST_Jc;
}

/** Document View Setting  Value */
export interface CT_View {
  val: ST_View;
}

/** Zoom Type */
export interface CT_Zoom {
  val?: ST_Zoom;
  percent: ST_DecimalNumber;
}

/** Writing Style Language */
export interface CT_WritingStyle {
  lang: ST_Lang;
  vendorID: ST_DecimalNumber;
  dllVersion: ST_DecimalNumber;
  nlCheck?: ST_OnOff;
  checkStyle: ST_OnOff;
  appName: ST_String;
}

/** Spell Checking State */
export interface CT_Proof {
  spelling?: ST_Proof;
  grammar?: ST_Proof;
}

/** Document Classification Value */
export interface CT_DocType {
  val: ST_DocType;
}

/** Document Editing Restrictions */
export interface CT_DocProtect {
  edit?: ST_DocProtect;
  formatting?: ST_OnOff;
  enforcement?: ST_OnOff;
}

/** Mail Merge Source Document Type */
export interface CT_MailMergeDocType {
  val: ST_MailMergeDocType;
}

/** Value */
export interface CT_MailMergeDataType {
  val: ST_MailMergeDataType;
}

/** Mail Merge Merged Document Type */
export interface CT_MailMergeDest {
  val: ST_MailMergeDest;
}

/** Merge Field Mapping Type */
export interface CT_MailMergeOdsoFMDFieldType {
  val: ST_MailMergeOdsoFMDFieldType;
}

/** Display Visual Indicator Of Markup Area */
export interface CT_TrackChangesView {
  markup?: ST_OnOff;
  comments?: ST_OnOff;
  insDel?: ST_OnOff;
  formatting?: ST_OnOff;
  inkAnnotations?: ST_OnOff;
}

/** Language For Which Custom Line Breaking Rule Applies */
export interface CT_Kinsoku {
  lang: ST_Lang;
  val: ST_String;
}

/** Direction of Text Flow */
export interface CT_TextDirection {
  val: ST_TextDirection;
}

/** Vertical Character Alignment Position */
export interface CT_TextAlignment {
  val: ST_TextAlignment;
}

/** Annotation Identifier */
export interface CT_Markup {
  id: ST_DecimalNumber;
}

/** Annotation Author */
export interface CT_TrackChange extends CT_Markup {
  author: ST_String;
  date?: ST_DateTime;
}

/** Revised Vertical Merge Setting */
export interface CT_CellMergeTrackChange extends CT_TrackChange {
  vMerge?: ST_AnnotationVMerge;
  vMergeOrig?: ST_AnnotationVMerge;
}

/** Annotation Marker Displaced By Custom XML Markup */
export interface CT_TrackChangeRange extends CT_TrackChange {
  displacedByCustomXml?: ST_DisplacedByCustomXml;
}

/** Annotation Marker Relocated For Custom XML Markup */
export interface CT_MarkupRange extends CT_Markup {
  displacedByCustomXml?: ST_DisplacedByCustomXml;
}

/** First Table Column Covered By Bookmark */
export interface CT_BookmarkRange extends CT_MarkupRange {
  colFirst?: ST_DecimalNumber;
  colLast?: ST_DecimalNumber;
}

/** Bookmark Name */
export interface CT_Bookmark extends CT_BookmarkRange {
  name: ST_String;
}

/** Annotation Author */
export interface CT_MoveBookmark extends CT_Bookmark {
  author: ST_String;
  date: ST_DateTime;
}

/** Initials of Comment Author */
export interface CT_Comment extends CT_TrackChange {
  initials?: ST_String;
}

/** Previous Numbering Value */
export interface CT_TrackChangeNumbering extends CT_TrackChange {
  original?: ST_String;
}

/** Previous Table-Level Property Exceptions */
export interface CT_TblPrExChange extends CT_TrackChange {
  tblPrEx: CT_TblPrExBase;
}

/** Previous Table Cell Properties */
export interface CT_TcPrChange extends CT_TrackChange {
  tcPr: CT_TcPrInner;
}

/** Previous Table Row Properties */
export interface CT_TrPrChange extends CT_TrackChange {
  trPr: CT_TrPrBase;
}

/** Previous Table Grid */
export interface CT_TblGridChange extends CT_Markup {
  tblGrid: CT_TblGridBase;
}

/** Previous Table Properties */
export interface CT_TblPrChange extends CT_TrackChange {
  tblPr: CT_TblPrBase;
}

/** Previous Section Properties */
export interface CT_SectPrChange extends CT_TrackChange {
  sectPr?: CT_SectPrBase;
}

/** Previous Paragraph Properties */
export interface CT_PPrChange extends CT_TrackChange {
  pPr: CT_PPrBase;
}

/** Previous Run Properties */
export interface CT_RPrChange extends CT_TrackChange {
  rPr: CT_RPrOriginal;
}

/** Previous Run Properties for the Paragraph Mark */
export interface CT_ParaRPrChange extends CT_TrackChange {
  rPr: CT_ParaRPrOriginal;
}

export interface CT_RunTrackChange extends CT_TrackChange {
  acc?: CT_Acc;
  bar?: CT_Bar;
  box?: CT_Box;
  borderBox?: CT_BorderBox;
  d?: CT_D;
  eqArr?: CT_EqArr;
  f?: CT_F;
  func?: CT_Func;
  groupChr?: CT_GroupChr;
  limLow?: CT_LimLow;
  limUpp?: CT_LimUpp;
  m?: CT_M;
  nary?: CT_Nary;
  phant?: CT_Phant;
  rad?: CT_Rad;
  sPre?: CT_SPre;
  sSub?: CT_SSub;
  sSubSup?: CT_SSubSup;
  sSup?: CT_SSup;
  r?: CT_R;
}

/** Numbering Level Reference */
export interface CT_NumPr {
  ilvl?: CT_DecimalNumber;
  numId?: CT_DecimalNumber;
  numberingChange?: CT_TrackChangeNumbering;
  ins?: CT_TrackChange;
}

/** Paragraph Border Above Identical Paragraphs */
export interface CT_PBdr {
  top?: CT_Border;
  left?: CT_Border;
  bottom?: CT_Border;
  right?: CT_Border;
  between?: CT_Border;
  bar?: CT_Border;
}

/** Custom Tab Stop */
export interface CT_Tabs {
  tab: CT_TabStop[];
}

/** Lines to Tight Wrap to Paragraph Extents */
export interface CT_TextboxTightWrap {
  val: ST_TextboxTightWrap;
}

/** Referenced Paragraph Style */
export interface CT_PPrBase {
  pStyle?: CT_String;
  keepNext?: CT_OnOff;
  keepLines?: CT_OnOff;
  pageBreakBefore?: CT_OnOff;
  framePr?: CT_FramePr;
  widowControl?: CT_OnOff;
  numPr?: CT_NumPr;
  suppressLineNumbers?: CT_OnOff;
  pBdr?: CT_PBdr;
  shd?: CT_Shd;
  tabs?: CT_Tabs;
  suppressAutoHyphens?: CT_OnOff;
  kinsoku?: CT_OnOff;
  wordWrap?: CT_OnOff;
  overflowPunct?: CT_OnOff;
  topLinePunct?: CT_OnOff;
  autoSpaceDE?: CT_OnOff;
  autoSpaceDN?: CT_OnOff;
  bidi?: CT_OnOff;
  adjustRightInd?: CT_OnOff;
  snapToGrid?: CT_OnOff;
  spacing?: CT_Spacing;
  ind?: CT_Ind;
  contextualSpacing?: CT_OnOff;
  mirrorIndents?: CT_OnOff;
  suppressOverlap?: CT_OnOff;
  jc?: CT_Jc;
  textDirection?: CT_TextDirection;
  textAlignment?: CT_TextAlignment;
  textboxTightWrap?: CT_TextboxTightWrap;
  outlineLvl?: CT_DecimalNumber;
  divId?: CT_DecimalNumber;
  cnfStyle?: CT_Cnf;
}

/** Run Properties for the Paragraph Mark */
export interface CT_PPr extends CT_PPrBase {
  rPr?: CT_ParaRPr;
  sectPr?: CT_SectPr;
  pPrChange?: CT_PPrChange;
}

/** Unique Name for Embedded Control */
export interface CT_Control {
  name?: ST_String;
  shapeid?: ST_String;
  id: string;
}

/** Background Color */
export interface CT_Background extends CT_PictureBase {
  color?: ST_HexColor;
  themeColor?: ST_ThemeColor;
  themeTint?: ST_UcharHexNumber;
  themeShade?: ST_UcharHexNumber;
}

/** Relationship to Part */
export interface CT_Rel {
  id: string;
}

export interface CT_PictureBase {}

/** Inline Embedded Control */
export interface CT_Object extends CT_PictureBase {
  dxaOrig?: ST_TwipsMeasure;
  dyaOrig?: ST_TwipsMeasure;
  control?: CT_Control;
}

/** Embedded Video */
export interface CT_Picture extends CT_PictureBase {
  movie?: CT_Rel;
  control?: CT_Control;
}

/** Drawing Element Anchor */
export interface CT_Drawing {
  anchor?: any;
  inline?: any;
}

/** Custom Field Data */
export interface CT_SimpleField {
  instr: ST_String;
  fldLock?: ST_OnOff;
  dirty?: ST_OnOff;
  fldData?: CT_Text;
  fldSimple?: CT_SimpleField[];
  hyperlink?: CT_Hyperlink;
  subDoc?: CT_Rel;
}

/** Text Box Form Field Type Values */
export interface CT_FFTextType {
  val: ST_FFTextType;
}

/** Form Field Name Value */
export interface CT_FFName {
  val?: ST_FFName;
}

/** Custom Field Data */
export interface CT_FldChar {
  fldCharType: ST_FldCharType;
  fldLock?: ST_OnOff;
  dirty?: ST_OnOff;
  fldData?: CT_Text;
  ffData?: CT_FFData;
  numberingChange?: CT_TrackChangeNumbering;
}

/** Hyperlink Target Frame */
export interface CT_Hyperlink {
  tgtFrame?: ST_String;
  tooltip?: ST_String;
  docLocation?: ST_String;
  history?: ST_OnOff;
  anchor?: ST_String;
  id: string;
  fldSimple?: CT_SimpleField[];
  hyperlink?: CT_Hyperlink;
  subDoc?: CT_Rel;
}

/** Form Field Name */
export interface CT_FFData {
  name: CT_FFName;
  enabled: CT_OnOff;
  calcOnExit: CT_OnOff;
  entryMacro?: CT_MacroName;
  exitMacro?: CT_MacroName;
  helpText?: CT_FFHelpText;
  statusText?: CT_FFStatusText;
  checkBox?: CT_FFCheckBox;
  ddList?: CT_FFDDList;
  textInput?: CT_FFTextInput;
}

/** Help Text Type */
export interface CT_FFHelpText {
  type?: ST_InfoTextType;
  val?: ST_FFHelpTextVal;
}

/** Status Text Type */
export interface CT_FFStatusText {
  type?: ST_InfoTextType;
  val?: ST_FFStatusTextVal;
}

/** Checkbox Form Field Size */
export interface CT_FFCheckBox {
  size?: CT_HpsMeasure;
  sizeAuto?: CT_OnOff;
  default?: CT_OnOff;
  checked?: CT_OnOff;
}

/** Drop-Down List Selection */
export interface CT_FFDDList {
  result?: CT_DecimalNumber;
  default?: CT_DecimalNumber;
  listEntry?: CT_String[];
}

/** Text Box Form Field Type */
export interface CT_FFTextInput {
  type?: CT_FFTextType;
  default?: CT_String;
  maxLength?: CT_DecimalNumber;
  format?: CT_String;
}

/** Section Type Setting */
export interface CT_SectType {
  val?: ST_SectionMark;
}

/** First Page Printer Tray Code */
export interface CT_PaperSource {
  first?: ST_DecimalNumber;
  other?: ST_DecimalNumber;
}

/** Page Width */
export interface CT_PageSz {
  w?: ST_TwipsMeasure;
  h?: ST_TwipsMeasure;
  orient?: ST_PageOrientation;
  code?: ST_DecimalNumber;
}

/** Top Margin Spacing */
export interface CT_PageMar {
  top: ST_SignedTwipsMeasure;
  right: ST_TwipsMeasure;
  bottom: ST_SignedTwipsMeasure;
  left: ST_TwipsMeasure;
  header: ST_TwipsMeasure;
  footer: ST_TwipsMeasure;
  gutter: ST_TwipsMeasure;
}

/** Top Border */
export interface CT_PageBorders {
  zOrder?: ST_PageBorderZOrder;
  display?: ST_PageBorderDisplay;
  offsetFrom?: ST_PageBorderOffset;
  top?: CT_Border;
  left?: CT_Border;
  bottom?: CT_Border;
  right?: CT_Border;
}

/** Line Number Increments to Display */
export interface CT_LineNumber {
  countBy?: ST_DecimalNumber;
  start?: ST_DecimalNumber;
  distance?: ST_TwipsMeasure;
  restart?: ST_LineNumberRestart;
}

/** Page Number Format */
export interface CT_PageNumber {
  fmt?: ST_NumberFormat;
  start?: ST_DecimalNumber;
  chapStyle?: ST_DecimalNumber;
  chapSep?: ST_ChapterSep;
}

/** Column Width */
export interface CT_Column {
  w?: ST_TwipsMeasure;
  space?: ST_TwipsMeasure;
}

/** Single Column Definition */
export interface CT_Columns {
  equalWidth?: ST_OnOff;
  space?: ST_TwipsMeasure;
  num?: ST_DecimalNumber;
  sep?: ST_OnOff;
  col: CT_Column[];
}

/** Vertical Alignment Setting */
export interface CT_VerticalJc {
  val: ST_VerticalJc;
}

/** Document Grid Type */
export interface CT_DocGrid {
  type?: ST_DocGrid;
  linePitch?: ST_DecimalNumber;
  charSpace?: ST_DecimalNumber;
}

/** Header or Footer Type */
export interface CT_HdrFtrRef extends CT_Rel {
  type: ST_HdrFtr;
}

export interface CT_HdrFtr {
  altChunk?: CT_AltChunk[];
}

export interface CT_SectPrBase {}

/** Revision Information for Section Properties */
export interface CT_SectPr {
  sectPrChange?: CT_SectPrChange;
}

/** Break Type */
export interface CT_Br {
  type?: ST_BrType;
  clear?: ST_BrClear;
}

/** Positional Tab Stop Alignment */
export interface CT_PTab {
  alignment: ST_PTabAlignment;
  relativeTo: ST_PTabRelativeTo;
  leader: ST_PTabLeader;
}

/** Symbol Character Font */
export interface CT_Sym {
  font?: ST_String;
  char?: ST_ShortHexNumber;
}

/** Proofing Error Anchor Type */
export interface CT_ProofErr {
  type: ST_ProofErr;
}

/** Annotation ID */
export interface CT_Perm {
  id: ST_String;
  displacedByCustomXml?: ST_DisplacedByCustomXml;
}

/** Editor Group For Range Permission */
export interface CT_PermStart extends CT_Perm {
  edGrp?: ST_EdGrp;
  ed?: ST_String;
  colFirst?: ST_DecimalNumber;
  colLast?: ST_DecimalNumber;
}

/** Revision Identifier for Run Properties */
export interface CT_R {
  rsidRPr?: ST_LongHexNumber;
  rsidDel?: ST_LongHexNumber;
  rsidR?: ST_LongHexNumber;
}

/** Font Content Type */
export interface CT_Fonts {
  hint?: ST_Hint;
  ascii?: ST_String;
  hAnsi?: ST_String;
  eastAsia?: ST_String;
  cs?: ST_String;
  asciiTheme?: ST_Theme;
  hAnsiTheme?: ST_Theme;
  eastAsiaTheme?: ST_Theme;
  cstheme?: ST_Theme;
}

export interface CT_RPr {}

export interface CT_RPrOriginal {}

export interface CT_ParaRPrOriginal {}

/** Revision Information for Run Properties on the Paragraph Mark */
export interface CT_ParaRPr {
  rPrChange?: CT_ParaRPrChange;
}

/** External Content Import Properties */
export interface CT_AltChunk {
  id: string;
  altChunkPr?: CT_AltChunkPr;
}

/** Keep Source Formatting on Import */
export interface CT_AltChunkPr {
  matchSrc?: CT_OnOff;
}

/** Phonetic Guide Text Alignment Value */
export interface CT_RubyAlign {
  val: ST_RubyAlign;
}

/** Phonetic Guide Text Alignment */
export interface CT_RubyPr {
  rubyAlign: CT_RubyAlign;
  hps: CT_HpsMeasure;
  hpsRaise: CT_HpsMeasure;
  hpsBaseText: CT_HpsMeasure;
  lid: CT_Lang;
  dirty?: CT_OnOff;
}

export interface CT_RubyContent {
  r?: CT_R;
}

/** Phonetic Guide Properties */
export interface CT_Ruby {
  rubyPr: CT_RubyPr;
  rt: CT_RubyContent;
  rubyBase: CT_RubyContent;
}

/** Locking Type */
export interface CT_Lock {
  val?: ST_Lock;
}

/** List Entry Display Text */
export interface CT_SdtListItem {
  displayText?: ST_String;
  value?: ST_String;
}

/** Date Storage Type */
export interface CT_SdtDateMappingType {
  val?: ST_SdtDateMappingType;
}

/** Calendar Type Value */
export interface CT_CalendarType {
  val?: ST_CalendarType;
}

/** Date Display Mask */
export interface CT_SdtDate {
  fullDate?: ST_DateTime;
  dateFormat?: CT_String;
  lid?: CT_Lang;
  storeMappedDataAs?: CT_SdtDateMappingType;
  calendar?: CT_CalendarType;
}

/** Combo Box List Item */
export interface CT_SdtComboBox {
  lastValue?: ST_String;
  listItem?: CT_SdtListItem[];
}

/** Document Part Gallery Filter */
export interface CT_SdtDocPart {
  docPartGallery?: CT_String;
  docPartCategory?: CT_String;
  docPartUnique?: CT_OnOff;
}

/** Drop-Down List Item */
export interface CT_SdtDropDownList {
  lastValue?: ST_String;
  listItem?: CT_SdtListItem[];
}

/** Document Part Reference */
export interface CT_Placeholder {
  docPart: CT_String;
}

/** Allow Soft Line Breaks */
export interface CT_SdtText {
  multiLine?: ST_OnOff;
}

/** XML Namespace Prefix Mappings */
export interface CT_DataBinding {
  prefixMappings?: ST_String;
  xpath: ST_String;
  storeItemID: ST_String;
}

/** Run Properties For Structured Document Tag Contents */
export interface CT_SdtPr {
  rPr?: CT_RPr;
  alias?: CT_String;
  lock?: CT_Lock;
  placeholder?: CT_Placeholder;
  showingPlcHdr?: CT_OnOff;
  dataBinding?: CT_DataBinding;
  temporary?: CT_OnOff;
  id?: CT_DecimalNumber;
  tag?: CT_String;
  equation: CT_Empty;
  comboBox: CT_SdtComboBox;
  date: CT_SdtDate;
  docPartObj: CT_SdtDocPart;
  docPartList: CT_SdtDocPart;
  dropDownList: CT_SdtDropDownList;
  picture: CT_Empty;
  richText: CT_Empty;
  text: CT_SdtText;
  citation: CT_Empty;
  group: CT_Empty;
  bibliography: CT_Empty;
}

/** Structured Document Tag End Character Run Properties */
export interface CT_SdtEndPr {
  rPr?: CT_RPr;
}

export interface CT_SdtContentRun {
  fldSimple?: CT_SimpleField[];
  hyperlink?: CT_Hyperlink;
  subDoc?: CT_Rel;
}

export interface CT_SdtContentBlock {
  customXml?: CT_CustomXmlBlock;
  sdt?: CT_SdtBlock;
  p?: CT_P[];
  tbl?: CT_Tbl[];
}

export interface CT_SdtContentRow {
  tr?: CT_Row[];
  customXml?: CT_CustomXmlRow;
  sdt?: CT_SdtRow;
}

export interface CT_SdtContentCell {
  tc?: CT_Tc[];
  customXml?: CT_CustomXmlCell;
  sdt?: CT_SdtCell;
}

/** Structured Document Tag Properties */
export interface CT_SdtBlock {
  sdtPr?: CT_SdtPr;
  sdtEndPr?: CT_SdtEndPr;
  sdtContent?: CT_SdtContentBlock;
}

/** Structured Document Tag Properties */
export interface CT_SdtRun {
  sdtPr?: CT_SdtPr;
  sdtEndPr?: CT_SdtEndPr;
  sdtContent?: CT_SdtContentRun;
}

/** Structured Document Tag Properties */
export interface CT_SdtCell {
  sdtPr?: CT_SdtPr;
  sdtEndPr?: CT_SdtEndPr;
  sdtContent?: CT_SdtContentCell;
}

/** Structured Document Tag Properties */
export interface CT_SdtRow {
  sdtPr?: CT_SdtPr;
  sdtEndPr?: CT_SdtEndPr;
  sdtContent?: CT_SdtContentRow;
}

/** Namespace */
export interface CT_Attr {
  uri?: ST_String;
  name: ST_String;
  val: ST_String;
}

/** Custom XML Element Properties */
export interface CT_CustomXmlRun {
  uri?: ST_String;
  element: ST_String;
  customXmlPr?: CT_CustomXmlPr;
  fldSimple?: CT_SimpleField[];
  hyperlink?: CT_Hyperlink;
  subDoc?: CT_Rel;
}

/** Smart Tag Properties */
export interface CT_SmartTagRun {
  uri?: ST_String;
  element: ST_String;
  smartTagPr?: CT_SmartTagPr;
  fldSimple?: CT_SimpleField[];
  hyperlink?: CT_Hyperlink;
  subDoc?: CT_Rel;
}

/** Custom XML Element Properties */
export interface CT_CustomXmlBlock {
  uri?: ST_String;
  element: ST_String;
  customXmlPr?: CT_CustomXmlPr;
  customXml?: CT_CustomXmlBlock;
  sdt?: CT_SdtBlock;
  p?: CT_P[];
  tbl?: CT_Tbl[];
}

/** Custom XML Element Placeholder Text */
export interface CT_CustomXmlPr {
  placeholder?: CT_String;
  attr?: CT_Attr[];
}

/** Custom XML Element Properties */
export interface CT_CustomXmlRow {
  uri?: ST_String;
  element: ST_String;
  customXmlPr?: CT_CustomXmlPr;
  tr?: CT_Row[];
  customXml?: CT_CustomXmlRow;
  sdt?: CT_SdtRow;
}

/** Custom XML Element Properties */
export interface CT_CustomXmlCell {
  uri?: ST_String;
  element: ST_String;
  customXmlPr?: CT_CustomXmlPr;
  tc?: CT_Tc[];
  customXml?: CT_CustomXmlCell;
  sdt?: CT_SdtCell;
}

/** Smart Tag Property */
export interface CT_SmartTagPr {
  attr?: CT_Attr[];
}

/** Paragraph Properties */
export interface CT_P {
  rsidRPr?: ST_LongHexNumber;
  rsidR?: ST_LongHexNumber;
  rsidDel?: ST_LongHexNumber;
  rsidP?: ST_LongHexNumber;
  rsidRDefault?: ST_LongHexNumber;
  pPr?: CT_PPr;
  fldSimple?: CT_SimpleField[];
  hyperlink?: CT_Hyperlink;
  subDoc?: CT_Rel;
}

/** Table Row Height */
export interface CT_Height {
  val?: ST_TwipsMeasure;
  hRule?: ST_HeightRule;
}

/** Table Width Value */
export interface CT_TblWidth {
  w?: ST_DecimalNumber;
  type?: ST_TblWidth;
}

/** Grid Column Width */
export interface CT_TblGridCol {
  w?: ST_TwipsMeasure;
}

/** Grid Column Definition */
export interface CT_TblGridBase {
  gridCol?: CT_TblGridCol[];
}

/** Revision Information for Table Grid Column Definitions */
export interface CT_TblGrid extends CT_TblGridBase {
  tblGridChange?: CT_TblGridChange;
}

/** Table Cell Top Border */
export interface CT_TcBorders {
  top?: CT_Border;
  left?: CT_Border;
  bottom?: CT_Border;
  right?: CT_Border;
  insideH?: CT_Border;
  insideV?: CT_Border;
  tl2br?: CT_Border;
  tr2bl?: CT_Border;
}

/** Table Cell Top Margin Exception */
export interface CT_TcMar {
  top?: CT_TblWidth;
  left?: CT_TblWidth;
  bottom?: CT_TblWidth;
  right?: CT_TblWidth;
}

/** Vertical Merge Type */
export interface CT_VMerge {
  val?: ST_Merge;
}

/** Horizontal Merge Type */
export interface CT_HMerge {
  val?: ST_Merge;
}

/** Table Cell Conditional Formatting */
export interface CT_TcPrBase {
  cnfStyle?: CT_Cnf;
  tcW?: CT_TblWidth;
  gridSpan?: CT_DecimalNumber;
  hMerge?: CT_HMerge;
  vMerge?: CT_VMerge;
  tcBorders?: CT_TcBorders;
  shd?: CT_Shd;
  noWrap?: CT_OnOff;
  tcMar?: CT_TcMar;
  textDirection?: CT_TextDirection;
  tcFitText?: CT_OnOff;
  vAlign?: CT_VerticalJc;
  hideMark?: CT_OnOff;
}

/** Revision Information for Table Cell Properties */
export interface CT_TcPr extends CT_TcPrInner {
  tcPrChange?: CT_TcPrChange;
}

export interface CT_TcPrInner extends CT_TcPrBase {}

/** Table Cell Properties */
export interface CT_Tc {
  tcPr?: CT_TcPr;
  altChunk?: CT_AltChunk[];
}

/** Conditional Formatting Bit Mask */
export interface CT_Cnf {
  val: ST_Cnf;
}

/** Table Row Conditional Formatting */
export interface CT_TrPrBase {
  cnfStyle?: CT_Cnf;
  divId?: CT_DecimalNumber;
  gridBefore?: CT_DecimalNumber;
  gridAfter?: CT_DecimalNumber;
  wBefore?: CT_TblWidth;
  wAfter?: CT_TblWidth;
  cantSplit?: CT_OnOff;
  trHeight?: CT_Height;
  tblHeader?: CT_OnOff;
  tblCellSpacing?: CT_TblWidth;
  jc?: CT_Jc;
  hidden?: CT_OnOff;
}

/** Inserted Table Row */
export interface CT_TrPr extends CT_TrPrBase {
  ins?: CT_TrackChange;
  del?: CT_TrackChange;
  trPrChange?: CT_TrPrChange;
}

/** Table-Level Property Exceptions */
export interface CT_Row {
  rsidRPr?: ST_LongHexNumber;
  rsidR?: ST_LongHexNumber;
  rsidDel?: ST_LongHexNumber;
  rsidTr?: ST_LongHexNumber;
  tblPrEx?: CT_TblPrEx;
  trPr?: CT_TrPr;
  tc?: CT_Tc[];
  customXml?: CT_CustomXmlCell;
  sdt?: CT_SdtCell;
}

/** Table Layout Setting */
export interface CT_TblLayoutType {
  type?: ST_TblLayoutType;
}

/** Floating Table Overlap Setting */
export interface CT_TblOverlap {
  val: ST_TblOverlap;
}

/** Distance From Left of Table to Text */
export interface CT_TblPPr {
  leftFromText?: ST_TwipsMeasure;
  rightFromText?: ST_TwipsMeasure;
  topFromText?: ST_TwipsMeasure;
  bottomFromText?: ST_TwipsMeasure;
  vertAnchor?: ST_VAnchor;
  horzAnchor?: ST_HAnchor;
  tblpXSpec?: ST_XAlign;
  tblpX?: ST_SignedTwipsMeasure;
  tblpYSpec?: ST_YAlign;
  tblpY?: ST_SignedTwipsMeasure;
}

/** Table Cell Top Margin Default */
export interface CT_TblCellMar {
  top?: CT_TblWidth;
  left?: CT_TblWidth;
  bottom?: CT_TblWidth;
  right?: CT_TblWidth;
}

/** Table Top Border */
export interface CT_TblBorders {
  top?: CT_Border;
  left?: CT_Border;
  bottom?: CT_Border;
  right?: CT_Border;
  insideH?: CT_Border;
  insideV?: CT_Border;
}

/** Referenced Table Style */
export interface CT_TblPrBase {
  tblStyle?: CT_String;
  tblpPr?: CT_TblPPr;
  tblOverlap?: CT_TblOverlap;
  bidiVisual?: CT_OnOff;
  tblStyleRowBandSize?: CT_DecimalNumber;
  tblStyleColBandSize?: CT_DecimalNumber;
  tblW?: CT_TblWidth;
  jc?: CT_Jc;
  tblCellSpacing?: CT_TblWidth;
  tblInd?: CT_TblWidth;
  tblBorders?: CT_TblBorders;
  shd?: CT_Shd;
  tblLayout?: CT_TblLayoutType;
  tblCellMar?: CT_TblCellMar;
  tblLook?: CT_ShortHexNumber;
}

/** Revision Information for Table Properties */
export interface CT_TblPr extends CT_TblPrBase {
  tblPrChange?: CT_TblPrChange;
}

/** Preferred Table Width Exception */
export interface CT_TblPrExBase {
  tblW?: CT_TblWidth;
  jc?: CT_Jc;
  tblCellSpacing?: CT_TblWidth;
  tblInd?: CT_TblWidth;
  tblBorders?: CT_TblBorders;
  shd?: CT_Shd;
  tblLayout?: CT_TblLayoutType;
  tblCellMar?: CT_TblCellMar;
  tblLook?: CT_ShortHexNumber;
}

/** Revision Information for Table-Level Property Exceptions */
export interface CT_TblPrEx extends CT_TblPrExBase {
  tblPrExChange?: CT_TblPrExChange;
}

/** Table Properties */
export interface CT_Tbl {
  tblPr: CT_TblPr;
  tblGrid: CT_TblGrid;
  tr?: CT_Row[];
  customXml?: CT_CustomXmlRow;
  sdt?: CT_SdtRow;
}

/** Footnote Position Type */
export interface CT_FtnPos {
  val: ST_FtnPos;
}

/** Endnote Position Type */
export interface CT_EdnPos {
  val: ST_EdnPos;
}

/** Numbering Format Type */
export interface CT_NumFmt {
  val: ST_NumberFormat;
}

/** Automatic Numbering Restart Value */
export interface CT_NumRestart {
  val: ST_RestartNumber;
}

/** Suppress Footnote/Endnote Reference Mark */
export interface CT_FtnEdnRef {
  customMarkFollows?: ST_OnOff;
  id: string;
}

/** Footnote/Endnote ID */
export interface CT_FtnEdnSepRef {
  id: ST_DecimalNumber;
}

/** Footnote/Endnote Type */
export interface CT_FtnEdn {
  type?: ST_FtnEdn;
  id: ST_DecimalNumber;
  altChunk?: CT_AltChunk[];
}

/** Footnote Placement */
export interface CT_FtnProps {
  pos?: CT_FtnPos;
  numFmt?: CT_NumFmt;
}

/** Endnote Placement */
export interface CT_EdnProps {
  pos?: CT_EdnPos;
  numFmt?: CT_NumFmt;
}

/** Special Footnote List */
export interface CT_FtnDocProps extends CT_FtnProps {
  footnote?: CT_FtnEdnSepRef[];
}

/** Special Endnote List */
export interface CT_EdnDocProps extends CT_EdnProps {
  endnote?: CT_FtnEdnSepRef[];
}

/** Record Is Included in Mail Merge */
export interface CT_RecipientData {
  active?: CT_OnOff;
  column: CT_DecimalNumber;
  uniqueTag: string;
}

/** Data About Single Data Source Record */
export interface CT_Recipients {
  recipientData: CT_RecipientData[];
}

/** Merge Field Mapping */
export interface CT_OdsoFieldMapData {
  type?: CT_MailMergeOdsoFMDFieldType;
  name?: CT_String;
  mappedName?: CT_String;
  column?: CT_DecimalNumber;
  lid?: CT_Lang;
  dynamicAddress?: CT_OnOff;
}

/** Data Source Type Value */
export interface CT_MailMergeSourceType {
  val?: any;
}

/** UDL Connection String */
export interface CT_Odso {
  udl?: CT_String;
  table?: CT_String;
  src?: CT_Rel;
  colDelim?: CT_DecimalNumber;
  type?: CT_MailMergeSourceType;
  fHdr?: CT_OnOff;
  fieldMapData?: CT_OdsoFieldMapData[];
  recipientData?: CT_Rel[];
}

/** Source Document Type */
export interface CT_MailMerge {
  mainDocumentType: CT_MailMergeDocType;
  linkToQuery?: CT_OnOff;
  dataType: CT_MailMergeDataType;
  connectString?: CT_String;
  query?: CT_String;
  dataSource?: CT_Rel;
  headerSource?: CT_Rel;
  doNotSuppressBlankLines?: CT_OnOff;
  destination?: CT_MailMergeDest;
  addressFieldName?: CT_String;
  mailSubject?: CT_String;
  mailAsAttachment?: CT_OnOff;
  viewMergedData?: CT_OnOff;
  activeRecord?: CT_DecimalNumber;
  checkErrors?: CT_DecimalNumber;
  odso?: CT_Odso;
}

/** Target Screen Size Value */
export interface CT_TargetScreenSz {
  val: ST_TargetScreenSz;
}

/** Use Simplified Rules For Table Border Conflicts */
export interface CT_Compat {
  useSingleBorderforContiguousCells?: CT_OnOff;
  wpJustification?: CT_OnOff;
  noTabHangInd?: CT_OnOff;
  noLeading?: CT_OnOff;
  spaceForUL?: CT_OnOff;
  noColumnBalance?: CT_OnOff;
  balanceSingleByteDoubleByteWidth?: CT_OnOff;
  noExtraLineSpacing?: CT_OnOff;
  doNotLeaveBackslashAlone?: CT_OnOff;
  ulTrailSpace?: CT_OnOff;
  doNotExpandShiftReturn?: CT_OnOff;
  spacingInWholePoints?: CT_OnOff;
  lineWrapLikeWord6?: CT_OnOff;
  printBodyTextBeforeHeader?: CT_OnOff;
  printColBlack?: CT_OnOff;
  wpSpaceWidth?: CT_OnOff;
  showBreaksInFrames?: CT_OnOff;
  subFontBySize?: CT_OnOff;
  suppressBottomSpacing?: CT_OnOff;
  suppressTopSpacing?: CT_OnOff;
  suppressSpacingAtTopOfPage?: CT_OnOff;
  suppressTopSpacingWP?: CT_OnOff;
  suppressSpBfAfterPgBrk?: CT_OnOff;
  swapBordersFacingPages?: CT_OnOff;
  convMailMergeEsc?: CT_OnOff;
  truncateFontHeightsLikeWP6?: CT_OnOff;
  mwSmallCaps?: CT_OnOff;
  usePrinterMetrics?: CT_OnOff;
  doNotSuppressParagraphBorders?: CT_OnOff;
  wrapTrailSpaces?: CT_OnOff;
  footnoteLayoutLikeWW8?: CT_OnOff;
  shapeLayoutLikeWW8?: CT_OnOff;
  alignTablesRowByRow?: CT_OnOff;
  forgetLastTabAlignment?: CT_OnOff;
  adjustLineHeightInTable?: CT_OnOff;
  autoSpaceLikeWord95?: CT_OnOff;
  noSpaceRaiseLower?: CT_OnOff;
  doNotUseHTMLParagraphAutoSpacing?: CT_OnOff;
  layoutRawTableWidth?: CT_OnOff;
  layoutTableRowsApart?: CT_OnOff;
  useWord97LineBreakRules?: CT_OnOff;
  doNotBreakWrappedTables?: CT_OnOff;
  doNotSnapToGridInCell?: CT_OnOff;
  selectFldWithFirstOrLastChar?: CT_OnOff;
  applyBreakingRules?: CT_OnOff;
  doNotWrapTextWithPunct?: CT_OnOff;
  doNotUseEastAsianBreakRules?: CT_OnOff;
  useWord2002TableStyleRules?: CT_OnOff;
  growAutofit?: CT_OnOff;
  useFELayout?: CT_OnOff;
  useNormalStyleForList?: CT_OnOff;
  doNotUseIndentAsNumberingTabStop?: CT_OnOff;
  useAltKinsokuLineBreakRules?: CT_OnOff;
  allowSpaceOfSameStyleInTable?: CT_OnOff;
  doNotSuppressIndentation?: CT_OnOff;
  doNotAutofitConstrainedTables?: CT_OnOff;
  autofitToFirstFixedWidthCell?: CT_OnOff;
  underlineTabInNumList?: CT_OnOff;
  displayHangulFixedWidth?: CT_OnOff;
  splitPgBreakAndParaMark?: CT_OnOff;
  doNotVertAlignCellWithSp?: CT_OnOff;
  doNotBreakConstrainedForcedTable?: CT_OnOff;
  doNotVertAlignInTxbx?: CT_OnOff;
  useAnsiKerningPairs?: CT_OnOff;
  cachedColBalance?: CT_OnOff;
}

/** Document Variable Name */
export interface CT_DocVar {
  name: ST_String;
  val: ST_String;
}

/** Single Document Variable */
export interface CT_DocVars {
  docVar?: CT_DocVar[];
}

/** Original Document Revision Save ID */
export interface CT_DocRsids {
  rsidRoot?: CT_LongHexNumber;
  rsid?: CT_LongHexNumber[];
}

/** Value */
export interface CT_CharacterSpacing {
  val: ST_CharacterSpacing;
}

/** XSL Transformation Location */
export interface CT_SaveThroughXslt {
  id: string;
  solutionID?: ST_String;
}

/** Run Properties */
export interface CT_RPrDefault {
  rPr?: CT_RPr;
}

/** Paragraph Properties */
export interface CT_PPrDefault {
  pPr?: CT_PPr;
}

/** Default Run Properties */
export interface CT_DocDefaults {
  rPrDefault?: CT_RPrDefault;
  pPrDefault?: CT_PPrDefault;
}

/** Background 1 Theme Color Mapping */
export interface CT_ColorSchemeMapping {
  bg1?: ST_ColorSchemeIndex;
  t1?: ST_ColorSchemeIndex;
  bg2?: ST_ColorSchemeIndex;
  t2?: ST_ColorSchemeIndex;
  accent1?: ST_ColorSchemeIndex;
  accent2?: ST_ColorSchemeIndex;
  accent3?: ST_ColorSchemeIndex;
  accent4?: ST_ColorSchemeIndex;
  accent5?: ST_ColorSchemeIndex;
  accent6?: ST_ColorSchemeIndex;
  hyperlink?: ST_ColorSchemeIndex;
  followedHyperlink?: ST_ColorSchemeIndex;
}

/** Use Actual Pages, Not Virtual Pages */
export interface CT_ReadingModeInkLockDown {
  actualPg: ST_OnOff;
  w: ST_PixelsMeasure;
  h: ST_PixelsMeasure;
  fontSz: ST_DecimalNumber;
}

/** Recommend Write Protection in User Interface */
export interface CT_WriteProtection {
  recommended?: ST_OnOff;
}

/** Write Protection */
export interface CT_Settings {
  writeProtection?: CT_WriteProtection;
  view?: CT_View;
  zoom?: CT_Zoom;
  removePersonalInformation?: CT_OnOff;
  removeDateAndTime?: CT_OnOff;
  doNotDisplayPageBoundaries?: CT_OnOff;
  displayBackgroundShape?: CT_OnOff;
  printPostScriptOverText?: CT_OnOff;
  printFractionalCharacterWidth?: CT_OnOff;
  printFormsData?: CT_OnOff;
  embedTrueTypeFonts?: CT_OnOff;
  embedSystemFonts?: CT_OnOff;
  saveSubsetFonts?: CT_OnOff;
  saveFormsData?: CT_OnOff;
  mirrorMargins?: CT_OnOff;
  alignBordersAndEdges?: CT_OnOff;
  bordersDoNotSurroundHeader?: CT_OnOff;
  bordersDoNotSurroundFooter?: CT_OnOff;
  gutterAtTop?: CT_OnOff;
  hideSpellingErrors?: CT_OnOff;
  hideGrammaticalErrors?: CT_OnOff;
  activeWritingStyle?: CT_WritingStyle[];
  proofState?: CT_Proof;
  formsDesign?: CT_OnOff;
  attachedTemplate?: CT_Rel;
  linkStyles?: CT_OnOff;
  stylePaneFormatFilter?: CT_ShortHexNumber;
  stylePaneSortMethod?: CT_ShortHexNumber;
  documentType?: CT_DocType;
  mailMerge?: CT_MailMerge;
  revisionView?: CT_TrackChangesView;
  trackRevisions?: CT_OnOff;
  doNotTrackMoves?: CT_OnOff;
  doNotTrackFormatting?: CT_OnOff;
  documentProtection?: CT_DocProtect;
  autoFormatOverride?: CT_OnOff;
  styleLockTheme?: CT_OnOff;
  styleLockQFSet?: CT_OnOff;
  defaultTabStop?: CT_TwipsMeasure;
  autoHyphenation?: CT_OnOff;
  consecutiveHyphenLimit?: CT_DecimalNumber;
  hyphenationZone?: CT_TwipsMeasure;
  doNotHyphenateCaps?: CT_OnOff;
  showEnvelope?: CT_OnOff;
  summaryLength?: CT_DecimalNumber;
  clickAndTypeStyle?: CT_String;
  defaultTableStyle?: CT_String;
  evenAndOddHeaders?: CT_OnOff;
  bookFoldRevPrinting?: CT_OnOff;
  bookFoldPrinting?: CT_OnOff;
  bookFoldPrintingSheets?: CT_DecimalNumber;
  drawingGridHorizontalSpacing?: CT_TwipsMeasure;
  drawingGridVerticalSpacing?: CT_TwipsMeasure;
  displayHorizontalDrawingGridEvery?: CT_DecimalNumber;
  displayVerticalDrawingGridEvery?: CT_DecimalNumber;
  doNotUseMarginsForDrawingGridOrigin?: CT_OnOff;
  drawingGridHorizontalOrigin?: CT_TwipsMeasure;
  drawingGridVerticalOrigin?: CT_TwipsMeasure;
  doNotShadeFormData?: CT_OnOff;
  noPunctuationKerning?: CT_OnOff;
  characterSpacingControl?: CT_CharacterSpacing;
  printTwoOnOne?: CT_OnOff;
  strictFirstAndLastChars?: CT_OnOff;
  noLineBreaksAfter?: CT_Kinsoku;
  noLineBreaksBefore?: CT_Kinsoku;
  savePreviewPicture?: CT_OnOff;
  doNotValidateAgainstSchema?: CT_OnOff;
  saveInvalidXml?: CT_OnOff;
  ignoreMixedContent?: CT_OnOff;
  alwaysShowPlaceholderText?: CT_OnOff;
  doNotDemarcateInvalidXml?: CT_OnOff;
  saveXmlDataOnly?: CT_OnOff;
  useXSLTWhenSaving?: CT_OnOff;
  saveThroughXslt?: CT_SaveThroughXslt;
  showXMLTags?: CT_OnOff;
  alwaysMergeEmptyNamespace?: CT_OnOff;
  updateFields?: CT_OnOff;
  hdrShapeDefaults?: CT_ShapeDefaults;
  footnotePr?: CT_FtnDocProps;
  endnotePr?: CT_EdnDocProps;
  compat?: CT_Compat;
  docVars?: CT_DocVars;
  rsids?: CT_DocRsids;
  mathPr?: any;
  uiCompat97To2003?: CT_OnOff;
  attachedSchema?: CT_String[];
  themeFontLang?: CT_Language;
  clrSchemeMapping?: CT_ColorSchemeMapping;
  doNotIncludeSubdocsInStats?: CT_OnOff;
  doNotAutoCompressPictures?: CT_OnOff;
  forceUpgrade?: CT_Empty;
  captions?: CT_Captions;
  readModeInkLockDown?: CT_ReadingModeInkLockDown;
  smartTagType?: CT_SmartTagType[];
  schemaLibrary?: any;
  shapeDefaults?: CT_ShapeDefaults;
  doNotEmbedSmartTags?: CT_OnOff;
  decimalSymbol?: CT_String;
  listSeparator?: CT_String;
}

/** Root Frameset Definition */
export interface CT_WebSettings {
  frameset?: CT_Frameset;
  divs?: CT_Divs;
  encoding?: CT_String;
  optimizeForBrowser?: CT_OnOff;
  relyOnVML?: CT_OnOff;
  allowPNG?: CT_OnOff;
  doNotRelyOnCSS?: CT_OnOff;
  doNotSaveAsSingleFile?: CT_OnOff;
  doNotOrganizeInFolder?: CT_OnOff;
  doNotUseLongFileNames?: CT_OnOff;
  pixelsPerInch?: CT_DecimalNumber;
  targetScreenSz?: CT_TargetScreenSz;
  saveSmartTagsAsXml?: CT_OnOff;
}

/** Scrollbar Display Option Value */
export interface CT_FrameScrollbar {
  val: ST_FrameScrollbar;
}

/** Frame Size */
export interface CT_Frame {
  sz?: CT_String;
  name?: CT_String;
  sourceFileName?: CT_Rel;
  marW?: CT_PixelsMeasure;
  marH?: CT_PixelsMeasure;
  scrollbar?: CT_FrameScrollbar;
  noResizeAllowed?: CT_OnOff;
  linkedToFile?: CT_OnOff;
}

/** Frameset Layout Value */
export interface CT_FrameLayout {
  val: ST_FrameLayout;
}

/** Frameset Splitter Width */
export interface CT_FramesetSplitbar {
  w?: CT_TwipsMeasure;
  color?: CT_Color;
  noBorder?: CT_OnOff;
  flatBorders?: CT_OnOff;
}

/** Nested Frameset Size */
export interface CT_Frameset {
  sz?: CT_String;
  framesetSplitbar?: CT_FramesetSplitbar;
  frameLayout?: CT_FrameLayout;
  frameset?: CT_Frameset[];
  frame?: CT_Frame[];
}

/** Picture Numbering Symbol Properties */
export interface CT_NumPicBullet {
  numPicBulletId: ST_DecimalNumber;
  pict: CT_Picture;
}

/** Character Type Between Numbering and Text */
export interface CT_LevelSuffix {
  val: ST_LevelSuffix;
}

/** Level Text */
export interface CT_LevelText {
  val?: ST_String;
  null?: ST_OnOff;
}

/** Use Legacy Numbering Properties */
export interface CT_LvlLegacy {
  legacy?: ST_OnOff;
  legacySpace?: ST_TwipsMeasure;
  legacyIndent?: ST_SignedTwipsMeasure;
}

/** Starting Value */
export interface CT_Lvl {
  ilvl: ST_DecimalNumber;
  tplc?: ST_LongHexNumber;
  tentative?: ST_OnOff;
  start?: CT_DecimalNumber;
  numFmt?: CT_NumFmt;
  lvlRestart?: CT_DecimalNumber;
  pStyle?: CT_String;
  isLgl?: CT_OnOff;
  suff?: CT_LevelSuffix;
  lvlText?: CT_LevelText;
  lvlPicBulletId?: CT_DecimalNumber;
  legacy?: CT_LvlLegacy;
  lvlJc?: CT_Jc;
  pPr?: CT_PPr;
  rPr?: CT_RPr;
}

/** Abstract Numbering Definition Type */
export interface CT_MultiLevelType {
  val: ST_MultiLevelType;
}

/** Abstract Numbering Definition Identifier */
export interface CT_AbstractNum {
  abstractNumId: ST_DecimalNumber;
  nsid?: CT_LongHexNumber;
  multiLevelType?: CT_MultiLevelType;
  tmpl?: CT_LongHexNumber;
  name?: CT_String;
  styleLink?: CT_String;
  numStyleLink?: CT_String;
  lvl?: CT_Lvl[];
}

/** Numbering Level Starting Value Override */
export interface CT_NumLvl {
  ilvl: ST_DecimalNumber;
  startOverride?: CT_DecimalNumber;
  lvl?: CT_Lvl;
}

/** Abstract Numbering Definition Reference */
export interface CT_Num {
  numId: ST_DecimalNumber;
  abstractNumId: CT_DecimalNumber;
  lvlOverride?: CT_NumLvl[];
}

/** Picture Numbering Symbol Definition */
export interface CT_Numbering {
  numPicBullet?: CT_NumPicBullet[];
  abstractNum?: CT_AbstractNum[];
  num?: CT_Num[];
  numIdMacAtCleanup?: CT_DecimalNumber;
}

/** Table Style Conditional Formatting Paragraph Properties */
export interface CT_TblStylePr {
  type: ST_TblStyleOverrideType;
  pPr?: CT_PPr;
  rPr?: CT_RPr;
  tblPr?: CT_TblPrBase;
  trPr?: CT_TrPr;
  tcPr?: CT_TcPr;
}

/** Primary Style Name */
export interface CT_Style {
  type?: ST_StyleType;
  styleId?: ST_String;
  default?: ST_OnOff;
  customStyle?: ST_OnOff;
  name?: CT_String;
  aliases?: CT_String;
  basedOn?: CT_String;
  next?: CT_String;
  link?: CT_String;
  autoRedefine?: CT_OnOff;
  hidden?: CT_OnOff;
  uiPriority?: CT_DecimalNumber;
  semiHidden?: CT_OnOff;
  unhideWhenUsed?: CT_OnOff;
  qFormat?: CT_OnOff;
  locked?: CT_OnOff;
  personal?: CT_OnOff;
  personalCompose?: CT_OnOff;
  personalReply?: CT_OnOff;
  rsid?: CT_LongHexNumber;
  pPr?: CT_PPr;
  rPr?: CT_RPr;
  tblPr?: CT_TblPrBase;
  trPr?: CT_TrPr;
  tcPr?: CT_TcPr;
  tblStylePr?: CT_TblStylePr[];
}

/** Primary Style Name */
export interface CT_LsdException {
  name: ST_String;
  locked?: ST_OnOff;
  uiPriority?: ST_DecimalNumber;
  semiHidden?: ST_OnOff;
  unhideWhenUsed?: ST_OnOff;
  qFormat?: ST_OnOff;
}

/** Latent Style Exception */
export interface CT_LatentStyles {
  defLockedState?: ST_OnOff;
  defUIPriority?: ST_DecimalNumber;
  defSemiHidden?: ST_OnOff;
  defUnhideWhenUsed?: ST_OnOff;
  defQFormat?: ST_OnOff;
  count?: ST_DecimalNumber;
  lsdException?: CT_LsdException[];
}

/** Document Default Paragraph and Run Properties */
export interface CT_Styles {
  docDefaults?: CT_DocDefaults;
  latentStyles?: CT_LatentStyles;
  style?: CT_Style[];
}

/** Value */
export interface CT_Panose {
  val: ST_Panose;
}

/** Font Family Value */
export interface CT_FontFamily {
  val: ST_FontFamily;
}

/** Value */
export interface CT_Pitch {
  val: ST_Pitch;
}

/** First 32 Bits of Unicode Subset Bitfield */
export interface CT_FontSig {
  usb0: any;
  usb1: any;
  usb2: any;
  usb3: any;
  csb0: any;
  csb1: any;
}

/** Embedded Font Obfuscation Key */
export interface CT_FontRel extends CT_Rel {
  fontKey?: ST_Guid;
  subsetted?: ST_OnOff;
}

/** Alternate Names for Font */
export interface CT_Font {
  name: ST_String;
  altName?: CT_String;
  panose1?: CT_Panose;
  charset?: CT_UcharHexNumber;
  family?: CT_FontFamily;
  notTrueType?: CT_OnOff;
  pitch?: CT_Pitch;
  sig?: CT_FontSig;
  embedRegular?: CT_FontRel;
  embedBold?: CT_FontRel;
  embedItalic?: CT_FontRel;
  embedBoldItalic?: CT_FontRel;
}

/** Properties for a Single Font */
export interface CT_FontsList {
  font?: CT_Font[];
}

/** Top Border for HTML div */
export interface CT_DivBdr {
  top?: CT_Border;
  left?: CT_Border;
  bottom?: CT_Border;
  right?: CT_Border;
}

/** Data for HTML blockquote Element */
export interface CT_Div {
  id: ST_DecimalNumber;
  blockQuote?: CT_OnOff;
  bodyDiv?: CT_OnOff;
  marLeft: CT_SignedTwipsMeasure;
  marRight: CT_SignedTwipsMeasure;
  marTop: CT_SignedTwipsMeasure;
  marBottom: CT_SignedTwipsMeasure;
  divBdr?: CT_DivBdr;
  divsChild?: CT_Divs[];
}

/** Information About Single HTML div Element */
export interface CT_Divs {
  div: CT_Div;
}

export interface CT_TxbxContent {
  altChunk?: CT_AltChunk[];
}

/** Document Final Section Properties */
export interface CT_Body {
  altChunk?: CT_AltChunk[];
  sectPr?: any;
}

export interface CT_ShapeDefaults {}

/** Comment Content */
export interface CT_Comments {
  comment?: CT_Comment[];
}

/** Footnote Content */
export interface CT_Footnotes {
  footnote?: CT_FtnEdn;
}

/** Endnote Content */
export interface CT_Endnotes {
  endnote?: CT_FtnEdn;
}

/** Smart Tag Namespace */
export interface CT_SmartTagType {
  namespaceuri?: ST_String;
  name?: ST_String;
  url?: ST_String;
}

/** Insertion Behavior Value */
export interface CT_DocPartBehavior {
  val?: any;
}

/** Entry Insertion Behavior */
export interface CT_DocPartBehaviors {
  behavior?: CT_DocPartBehavior[];
}

/** Type Value */
export interface CT_DocPartType {
  val?: any;
}

/** Entry Type */
export interface CT_DocPartTypes {
  all?: ST_OnOff;
  type?: CT_DocPartType[];
}

/** Gallery Value */
export interface CT_DocPartGallery {
  val: ST_DocPartGallery;
}

/** Category Associated With Entry */
export interface CT_DocPartCategory {
  name: CT_String;
  gallery: CT_DocPartGallery;
}

/** Name Value */
export interface CT_DocPartName {
  val: ST_String;
  decorated?: ST_OnOff;
}

/** Entry Name */
export interface CT_DocPartPr {
  name: CT_DocPartName;
  style: CT_String;
  category: CT_DocPartCategory;
  types: CT_DocPartTypes;
  behaviors: CT_DocPartBehaviors;
  description: CT_String;
  guid: CT_Guid;
}

/** Glossary Document Entry Properties */
export interface CT_DocPart {
  docPartPr?: CT_DocPartPr;
  docPartBody?: CT_Body;
}

/** Glossary Document Entry */
export interface CT_DocParts {
  docPart?: CT_DocPart[];
}

/** Caption Type Name */
export interface CT_Caption {
  name: ST_String;
  pos?: ST_CaptionPos;
  chapNum?: ST_OnOff;
  heading?: ST_DecimalNumber;
  noLabel?: ST_OnOff;
  numFmt?: ST_NumberFormat;
  sep?: ST_ChapterSep;
}

/** Identifier of Object to be Automatically Captioned */
export interface CT_AutoCaption {
  name: ST_String;
  caption: ST_String;
}

/** Single Automatic Captioning Setting */
export interface CT_AutoCaptions {
  autoCaption: CT_AutoCaption[];
}

/** Single Caption Type Definition */
export interface CT_Captions {
  caption: CT_Caption[];
  autoCaptions?: CT_AutoCaptions;
}

/** Document Background */
export interface CT_DocumentBase {
  background?: CT_Background;
}

/** Document Body */
export interface CT_Document extends CT_DocumentBase {
  body?: CT_Body;
}

/** List of Glossary Document Entries */
export interface CT_GlossaryDocument extends CT_DocumentBase {
  docParts?: CT_DocParts;
}
