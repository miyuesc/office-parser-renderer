/**
 * vml-wordprocessingDrawing.xsd
 */

/** Border Type */
export enum ST_BorderType {
  /** No Border */
  none = 'none',
  /** Single Line Border */
  single = 'single',
  /** Thick Line Border */
  thick = 'thick',
  /** Double Line Border */
  double = 'double',
  /** Hairline Border */
  hairline = 'hairline',
  /** Dotted Border */
  dot = 'dot',
  /** pecifies a line border consisting of a dashed line around the parent object. */
  dash = 'dash',
  /** Dot Dash Border */
  dotDash = 'dotDash',
  /** Dash Dot Dot Border */
  dashDotDot = 'dashDotDot',
  /** Triple Line Border */
  triple = 'triple',
  /** Thin Thick Small Gap Border */
  thinThickSmall = 'thinThickSmall',
  /** Small thick-thin lines border */
  thickThinSmall = 'thickThinSmall',
  /** Small thin-thick-thin Lines Border */
  thickBetweenThinSmall = 'thickBetweenThinSmall',
  /** Thin Thick Line Border */
  thinThick = 'thinThick',
  /** Thick Thin Line Border */
  thickThin = 'thickThin',
  /** Thin-thick-thin Border */
  thickBetweenThin = 'thickBetweenThin',
  /** Thin Thick Large Gap Border */
  thinThickLarge = 'thinThickLarge',
  /** Thick Thin Large Gap Border */
  thickThinLarge = 'thickThinLarge',
  /** Large thin-thick-thin Border */
  thickBetweenThinLarge = 'thickBetweenThinLarge',
  /** Wavy Border */
  wave = 'wave',
  /** Double Wavy Lines Border */
  doubleWave = 'doubleWave',
  /** Small Dash Border */
  dashedSmall = 'dashedSmall',
  /** Stroked Dash Dot Border */
  dashDotStroked = 'dashDotStroked',
  /** 3D Embossed Border */
  threeDEmboss = 'threeDEmboss',
  /** 3D Engraved Border */
  threeDEngrave = 'threeDEngrave',
  /** Outset Border */
  HTMLOutset = 'HTMLOutset',
  /** Inset Border */
  HTMLInset = 'HTMLInset'
}

/** Border Shadow Type */
export enum ST_BorderShadow {
  /** True */
  t = 't',
  /** True */
  true = 'true',
  /** False */
  f = 'f',
  /** False */
  false = 'false'
}

/** Text Wrapping Type */
export enum ST_WrapType {
  /** Top and bottom wrapping */
  topAndBottom = 'topAndBottom',
  /** Square wrapping */
  square = 'square',
  /** No wrapping */
  none = 'none',
  /** Tight wrapping */
  tight = 'tight',
  /** Through wrapping */
  through = 'through'
}

/** Text Wrapping Side */
export enum ST_WrapSide {
  /** Both sides */
  both = 'both',
  /** Left side */
  left = 'left',
  /** Right side */
  right = 'right',
  /** Largest side */
  largest = 'largest'
}

/** Horizontal Anchor Type */
export enum ST_HorizontalAnchor {
  /** Margin */
  margin = 'margin',
  /** Page */
  page = 'page',
  /** Text */
  text = 'text',
  /** Character */
  char = 'char'
}

/** Vertical Anchor Type */
export enum ST_VerticalAnchor {
  /** Margin */
  margin = 'margin',
  /** Page */
  page = 'page',
  /** Text */
  text = 'text',
  /** Line */
  line = 'line'
}

/** Border Style */
export interface CT_Border {
  type?: ST_BorderType;
  width?: any;
  shadow?: ST_BorderShadow;
}

/** Wrapping type */
export interface CT_Wrap {
  type?: ST_WrapType;
  side?: ST_WrapSide;
  anchorx?: ST_HorizontalAnchor;
  anchory?: ST_VerticalAnchor;
}

export interface CT_AnchorLock {}
