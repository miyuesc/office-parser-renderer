import { ST_DrawingElementId, ST_PositiveCoordinate } from './dml-baseTypes';

/**
 * dml-shapeGeometry.xsd
 */

/** Preset Shape Types */
export enum ST_ShapeType {
    /** Line Shape */
    line = "line",
    /** Line Inverse Shape */
    lineInv = "lineInv",
    /** Triangle Shape */
    triangle = "triangle",
    /** Right Triangle Shape */
    rtTriangle = "rtTriangle",
    /** Rectangle Shape */
    rect = "rect",
    /** Diamond Shape */
    diamond = "diamond",
    /** Parallelogram Shape */
    parallelogram = "parallelogram",
    /** Trapezoid Shape */
    trapezoid = "trapezoid",
    /** Non-Isosceles Trapezoid Shape */
    nonIsoscelesTrapezoid = "nonIsoscelesTrapezoid",
    /** Pentagon Shape */
    pentagon = "pentagon",
    /** Hexagon Shape */
    hexagon = "hexagon",
    /** Heptagon Shape */
    heptagon = "heptagon",
    /** Octagon Shape */
    octagon = "octagon",
    /** Decagon Shape */
    decagon = "decagon",
    /** Dodecagon Shape */
    dodecagon = "dodecagon",
    /** Four Pointed Star Shape */
    star4 = "star4",
    /** Five Pointed Star Shape */
    star5 = "star5",
    /** Six Pointed Star Shape */
    star6 = "star6",
    /** Seven Pointed Star Shape */
    star7 = "star7",
    /** Eight Pointed Star Shape */
    star8 = "star8",
    /** Ten Pointed Star Shape */
    star10 = "star10",
    /** Twelve Pointed Star Shape */
    star12 = "star12",
    /** Sixteen Pointed Star Shape */
    star16 = "star16",
    /** Twenty Four Pointed Star Shape */
    star24 = "star24",
    /** Thirty Two Pointed Star Shape */
    star32 = "star32",
    /** Round Corner Rectangle Shape */
    roundRect = "roundRect",
    /** One Round Corner Rectangle Shape */
    round1Rect = "round1Rect",
    /** Two Same-side Round Corner Rectangle Shape */
    round2SameRect = "round2SameRect",
    /** Two Diagonal Round Corner Rectangle Shape */
    round2DiagRect = "round2DiagRect",
    /** One Snip One Round Corner Rectangle Shape */
    snipRoundRect = "snipRoundRect",
    /** One Snip Corner Rectangle Shape */
    snip1Rect = "snip1Rect",
    /** Two Same-side Snip Corner Rectangle Shape */
    snip2SameRect = "snip2SameRect",
    /** Two Diagonal Snip Corner Rectangle Shape */
    snip2DiagRect = "snip2DiagRect",
    /** Plaque Shape */
    plaque = "plaque",
    /** Ellipse Shape */
    ellipse = "ellipse",
    /** Teardrop Shape */
    teardrop = "teardrop",
    /** Home Plate Shape */
    homePlate = "homePlate",
    /** Chevron Shape */
    chevron = "chevron",
    /** Pie Wedge Shape */
    pieWedge = "pieWedge",
    /** Pie Shape */
    pie = "pie",
    /** Block Arc Shape */
    blockArc = "blockArc",
    /** Donut Shape */
    donut = "donut",
    /** No Smoking Shape */
    noSmoking = "noSmoking",
    /** Right Arrow Shape */
    rightArrow = "rightArrow",
    /** Left Arrow Shape */
    leftArrow = "leftArrow",
    /** Up Arrow Shape */
    upArrow = "upArrow",
    /** Down Arrow Shape */
    downArrow = "downArrow",
    /** Striped Right Arrow Shape */
    stripedRightArrow = "stripedRightArrow",
    /** Notched Right Arrow Shape */
    notchedRightArrow = "notchedRightArrow",
    /** Bent Up Arrow Shape */
    bentUpArrow = "bentUpArrow",
    /** Left Right Arrow Shape */
    leftRightArrow = "leftRightArrow",
    /** Up Down Arrow Shape */
    upDownArrow = "upDownArrow",
    /** Left Up Arrow Shape */
    leftUpArrow = "leftUpArrow",
    /** Left Right Up Arrow Shape */
    leftRightUpArrow = "leftRightUpArrow",
    /** Quad-Arrow Shape */
    quadArrow = "quadArrow",
    /** Callout Left Arrow Shape */
    leftArrowCallout = "leftArrowCallout",
    /** Callout Right Arrow Shape */
    rightArrowCallout = "rightArrowCallout",
    /** Callout Up Arrow Shape */
    upArrowCallout = "upArrowCallout",
    /** Callout Down Arrow Shape */
    downArrowCallout = "downArrowCallout",
    /** Callout Left Right Arrow Shape */
    leftRightArrowCallout = "leftRightArrowCallout",
    /** Callout Up Down Arrow Shape */
    upDownArrowCallout = "upDownArrowCallout",
    /** Callout Quad-Arrow Shape */
    quadArrowCallout = "quadArrowCallout",
    /** Bent Arrow Shape */
    bentArrow = "bentArrow",
    /** U-Turn Arrow Shape */
    uturnArrow = "uturnArrow",
    /** Circular Arrow Shape */
    circularArrow = "circularArrow",
    /** Left Circular Arrow Shape */
    leftCircularArrow = "leftCircularArrow",
    /** Left Right Circular Arrow Shape */
    leftRightCircularArrow = "leftRightCircularArrow",
    /** Curved Right Arrow Shape */
    curvedRightArrow = "curvedRightArrow",
    /** Curved Left Arrow Shape */
    curvedLeftArrow = "curvedLeftArrow",
    /** Curved Up Arrow Shape */
    curvedUpArrow = "curvedUpArrow",
    /** Curved Down Arrow Shape */
    curvedDownArrow = "curvedDownArrow",
    /** Swoosh Arrow Shape */
    swooshArrow = "swooshArrow",
    /** Cube Shape */
    cube = "cube",
    /** Can Shape */
    can = "can",
    /** Lightning Bolt Shape */
    lightningBolt = "lightningBolt",
    /** Heart Shape */
    heart = "heart",
    /** Sun Shape */
    sun = "sun",
    /** Moon Shape */
    moon = "moon",
    /** Smiley Face Shape */
    smileyFace = "smileyFace",
    /** Irregular Seal 1 Shape */
    irregularSeal1 = "irregularSeal1",
    /** Irregular Seal 2 Shape */
    irregularSeal2 = "irregularSeal2",
    /** Folded Corner Shape */
    foldedCorner = "foldedCorner",
    /** Bevel Shape */
    bevel = "bevel",
    /** Frame Shape */
    frame = "frame",
    /** Half Frame Shape */
    halfFrame = "halfFrame",
    /** Corner Shape */
    corner = "corner",
    /** Diagonal Stripe Shape */
    diagStripe = "diagStripe",
    /** Chord Shape */
    chord = "chord",
    /** Curved Arc Shape */
    arc = "arc",
    /** Left Bracket Shape */
    leftBracket = "leftBracket",
    /** Right Bracket Shape */
    rightBracket = "rightBracket",
    /** Left Brace Shape */
    leftBrace = "leftBrace",
    /** Right Brace Shape */
    rightBrace = "rightBrace",
    /** Bracket Pair Shape */
    bracketPair = "bracketPair",
    /** Brace Pair Shape */
    bracePair = "bracePair",
    /** Straight Connector 1 Shape */
    straightConnector1 = "straightConnector1",
    /** Bent Connector 2 Shape */
    bentConnector2 = "bentConnector2",
    /** Bent Connector 3 Shape */
    bentConnector3 = "bentConnector3",
    /** Bent Connector 4 Shape */
    bentConnector4 = "bentConnector4",
    /** Bent Connector 5 Shape */
    bentConnector5 = "bentConnector5",
    /** Curved Connector 2 Shape */
    curvedConnector2 = "curvedConnector2",
    /** Curved Connector 3 Shape */
    curvedConnector3 = "curvedConnector3",
    /** Curved Connector 4 Shape */
    curvedConnector4 = "curvedConnector4",
    /** Curved Connector 5 Shape */
    curvedConnector5 = "curvedConnector5",
    /** Callout 1 Shape */
    callout1 = "callout1",
    /** Callout 2 Shape */
    callout2 = "callout2",
    /** Callout 3 Shape */
    callout3 = "callout3",
    /** Callout 1 Shape */
    accentCallout1 = "accentCallout1",
    /** Callout 2 Shape */
    accentCallout2 = "accentCallout2",
    /** Callout 3 Shape */
    accentCallout3 = "accentCallout3",
    /** Callout 1 with Border Shape */
    borderCallout1 = "borderCallout1",
    /** Callout 2 with Border Shape */
    borderCallout2 = "borderCallout2",
    /** Callout 3 with Border Shape */
    borderCallout3 = "borderCallout3",
    /** Callout 1 with Border and Accent Shape */
    accentBorderCallout1 = "accentBorderCallout1",
    /** Callout 2 with Border and Accent Shape */
    accentBorderCallout2 = "accentBorderCallout2",
    /** Callout 3 with Border and Accent Shape */
    accentBorderCallout3 = "accentBorderCallout3",
    /** Callout Wedge Rectangle Shape */
    wedgeRectCallout = "wedgeRectCallout",
    /** Callout Wedge Round Rectangle Shape */
    wedgeRoundRectCallout = "wedgeRoundRectCallout",
    /** Callout Wedge Ellipse Shape */
    wedgeEllipseCallout = "wedgeEllipseCallout",
    /** Callout Cloud Shape */
    cloudCallout = "cloudCallout",
    /** Cloud Shape */
    cloud = "cloud",
    /** Ribbon Shape */
    ribbon = "ribbon",
    /** Ribbon 2 Shape */
    ribbon2 = "ribbon2",
    /** Ellipse Ribbon Shape */
    ellipseRibbon = "ellipseRibbon",
    /** Ellipse Ribbon 2 Shape */
    ellipseRibbon2 = "ellipseRibbon2",
    /** Left Right Ribbon Shape */
    leftRightRibbon = "leftRightRibbon",
    /** Vertical Scroll Shape */
    verticalScroll = "verticalScroll",
    /** Horizontal Scroll Shape */
    horizontalScroll = "horizontalScroll",
    /** Wave Shape */
    wave = "wave",
    /** Double Wave Shape */
    doubleWave = "doubleWave",
    /** Plus Shape */
    plus = "plus",
    /** Process Flow Shape */
    flowChartProcess = "flowChartProcess",
    /** Decision Flow Shape */
    flowChartDecision = "flowChartDecision",
    /** Input Output Flow Shape */
    flowChartInputOutput = "flowChartInputOutput",
    /** Predefined Process Flow Shape */
    flowChartPredefinedProcess = "flowChartPredefinedProcess",
    /** Internal Storage Flow Shape */
    flowChartInternalStorage = "flowChartInternalStorage",
    /** Document Flow Shape */
    flowChartDocument = "flowChartDocument",
    /** Multi-Document Flow Shape */
    flowChartMultidocument = "flowChartMultidocument",
    /** Terminator Flow Shape */
    flowChartTerminator = "flowChartTerminator",
    /** Preparation Flow Shape */
    flowChartPreparation = "flowChartPreparation",
    /** Manual Input Flow Shape */
    flowChartManualInput = "flowChartManualInput",
    /** Manual Operation Flow Shape */
    flowChartManualOperation = "flowChartManualOperation",
    /** Connector Flow Shape */
    flowChartConnector = "flowChartConnector",
    /** Punched Card Flow Shape */
    flowChartPunchedCard = "flowChartPunchedCard",
    /** Punched Tape Flow Shape */
    flowChartPunchedTape = "flowChartPunchedTape",
    /** Summing Junction Flow Shape */
    flowChartSummingJunction = "flowChartSummingJunction",
    /** Or Flow Shape */
    flowChartOr = "flowChartOr",
    /** Collate Flow Shape */
    flowChartCollate = "flowChartCollate",
    /** Sort Flow Shape */
    flowChartSort = "flowChartSort",
    /** Extract Flow Shape */
    flowChartExtract = "flowChartExtract",
    /** Merge Flow Shape */
    flowChartMerge = "flowChartMerge",
    /** Offline Storage Flow Shape */
    flowChartOfflineStorage = "flowChartOfflineStorage",
    /** Online Storage Flow Shape */
    flowChartOnlineStorage = "flowChartOnlineStorage",
    /** Magnetic Tape Flow Shape */
    flowChartMagneticTape = "flowChartMagneticTape",
    /** Magnetic Disk Flow Shape */
    flowChartMagneticDisk = "flowChartMagneticDisk",
    /** Magnetic Drum Flow Shape */
    flowChartMagneticDrum = "flowChartMagneticDrum",
    /** Display Flow Shape */
    flowChartDisplay = "flowChartDisplay",
    /** Delay Flow Shape */
    flowChartDelay = "flowChartDelay",
    /** Alternate Process Flow Shape */
    flowChartAlternateProcess = "flowChartAlternateProcess",
    /** Off-Page Connector Flow Shape */
    flowChartOffpageConnector = "flowChartOffpageConnector",
    /** Blank Button Shape */
    actionButtonBlank = "actionButtonBlank",
    /** Home Button Shape */
    actionButtonHome = "actionButtonHome",
    /** Help Button Shape */
    actionButtonHelp = "actionButtonHelp",
    /** Information Button Shape */
    actionButtonInformation = "actionButtonInformation",
    /** Forward or Next Button Shape */
    actionButtonForwardNext = "actionButtonForwardNext",
    /** Back or Previous Button Shape */
    actionButtonBackPrevious = "actionButtonBackPrevious",
    /** End Button Shape */
    actionButtonEnd = "actionButtonEnd",
    /** Beginning Button Shape */
    actionButtonBeginning = "actionButtonBeginning",
    /** Return Button Shape */
    actionButtonReturn = "actionButtonReturn",
    /** Document Button Shape */
    actionButtonDocument = "actionButtonDocument",
    /** Sound Button Shape */
    actionButtonSound = "actionButtonSound",
    /** Movie Button Shape */
    actionButtonMovie = "actionButtonMovie",
    /** Gear 6 Shape */
    gear6 = "gear6",
    /** Gear 9 Shape */
    gear9 = "gear9",
    /** Funnel Shape */
    funnel = "funnel",
    /** Plus Math Shape */
    mathPlus = "mathPlus",
    /** Minus Math Shape */
    mathMinus = "mathMinus",
    /** Multiply Math Shape */
    mathMultiply = "mathMultiply",
    /** Divide Math Shape */
    mathDivide = "mathDivide",
    /** Equal Math Shape */
    mathEqual = "mathEqual",
    /** Not Equal Math Shape */
    mathNotEqual = "mathNotEqual",
    /** Corner Tabs Shape */
    cornerTabs = "cornerTabs",
    /** Square Tabs Shape */
    squareTabs = "squareTabs",
    /** Plaque Tabs Shape */
    plaqueTabs = "plaqueTabs",
    /** Chart X Shape */
    chartX = "chartX",
    /** Chart Star Shape */
    chartStar = "chartStar",
    /** Chart Plus Shape */
    chartPlus = "chartPlus",
}

/** Preset Text Shape Types */
export enum ST_TextShapeType {
    /** No Text Shape */
    textNoShape = "textNoShape",
    /** Plain Text Shape */
    textPlain = "textPlain",
    /** Stop Sign Text Shape */
    textStop = "textStop",
    /** Triangle Text Shape */
    textTriangle = "textTriangle",
    /** Inverted Triangle Text Shape */
    textTriangleInverted = "textTriangleInverted",
    /** Chevron Text Shape */
    textChevron = "textChevron",
    /** Inverted Chevron Text Shape */
    textChevronInverted = "textChevronInverted",
    /** Inside Ring Text Shape */
    textRingInside = "textRingInside",
    /** Outside Ring Text Shape */
    textRingOutside = "textRingOutside",
    /** Upward Arch Text Shape */
    textArchUp = "textArchUp",
    /** Downward Arch Text Shape */
    textArchDown = "textArchDown",
    /** Circle Text Shape */
    textCircle = "textCircle",
    /** Button Text Shape */
    textButton = "textButton",
    /** Upward Pour Arch Text Shape */
    textArchUpPour = "textArchUpPour",
    /** Downward Pour Arch Text Shape */
    textArchDownPour = "textArchDownPour",
    /** Circle Pour Text Shape */
    textCirclePour = "textCirclePour",
    /** Button Pour Text Shape */
    textButtonPour = "textButtonPour",
    /** Upward Curve Text Shape */
    textCurveUp = "textCurveUp",
    /** Downward Curve Text Shape */
    textCurveDown = "textCurveDown",
    /** Upward Can Text Shape */
    textCanUp = "textCanUp",
    /** Downward Can Text Shape */
    textCanDown = "textCanDown",
    /** Wave 1 Text Shape */
    textWave1 = "textWave1",
    /** Wave 2 Text Shape */
    textWave2 = "textWave2",
    /** Double Wave 1 Text Shape */
    textDoubleWave1 = "textDoubleWave1",
    /** Wave 4 Text Shape */
    textWave4 = "textWave4",
    /** Inflate Text Shape */
    textInflate = "textInflate",
    /** Deflate Text Shape */
    textDeflate = "textDeflate",
    /** Bottom Inflate Text Shape */
    textInflateBottom = "textInflateBottom",
    /** Bottom Deflate Text Shape */
    textDeflateBottom = "textDeflateBottom",
    /** Top Inflate Text Shape */
    textInflateTop = "textInflateTop",
    /** Top Deflate Text Shape */
    textDeflateTop = "textDeflateTop",
    /** Deflate-Inflate Text Shape */
    textDeflateInflate = "textDeflateInflate",
    /** Deflate-Inflate-Deflate Text Shape */
    textDeflateInflateDeflate = "textDeflateInflateDeflate",
    /** Right Fade Text Shape */
    textFadeRight = "textFadeRight",
    /** Left Fade Text Shape */
    textFadeLeft = "textFadeLeft",
    /** Upward Fade Text Shape */
    textFadeUp = "textFadeUp",
    /** Downward Fade Text Shape */
    textFadeDown = "textFadeDown",
    /** Upward Slant Text Shape */
    textSlantUp = "textSlantUp",
    /** Downward Slant Text Shape */
    textSlantDown = "textSlantDown",
    /** Upward Cascade Text Shape */
    textCascadeUp = "textCascadeUp",
    /** Downward Cascade Text Shape */
    textCascadeDown = "textCascadeDown",
}

/** Geometry Guide Name Properties */
export type ST_GeomGuideName = string;

/** Geometry Guide Formula Properties */
export type ST_GeomGuideFormula = string;

/** Adjustable Coordinate Methods */
export type ST_AdjCoordinate = string;

/** Adjustable Angle Methods */
export type ST_AdjAngle = string;

/** Path Fill Mode */
export enum ST_PathFillMode {
    /** No Path Fill */
    none = "none",
    /** Normal Path Fill */
    norm = "norm",
    /** Lighten Path Fill */
    lighten = "lighten",
    /** Lighten Path Fill Less */
    lightenLess = "lightenLess",
    /** Darken Path Fill */
    darken = "darken",
    /** Darken Path Fill Less */
    darkenLess = "darkenLess",
}

/** Shape Guide Name */
export interface CT_GeomGuide {
    name: ST_GeomGuideName;
    fmla: ST_GeomGuideFormula;
}

/** Shape Guide */
export interface CT_GeomGuideList {
    gd?: CT_GeomGuide[];
}

/** X-Coordinate */
export interface CT_AdjPoint2D {
    x: ST_AdjCoordinate;
    y: ST_AdjCoordinate;
}

/** Left */
export interface CT_GeomRect {
    l: ST_AdjCoordinate;
    t: ST_AdjCoordinate;
    r: ST_AdjCoordinate;
    b: ST_AdjCoordinate;
}

/** Position */
export interface CT_XYAdjustHandle {
    gdRefX?: ST_GeomGuideName;
    minX?: ST_AdjCoordinate;
    maxX?: ST_AdjCoordinate;
    gdRefY?: ST_GeomGuideName;
    minY?: ST_AdjCoordinate;
    maxY?: ST_AdjCoordinate;
    pos: CT_AdjPoint2D;
}

/** Shape Position Coordinate */
export interface CT_PolarAdjustHandle {
    gdRefR?: ST_GeomGuideName;
    minR?: ST_AdjCoordinate;
    maxR?: ST_AdjCoordinate;
    gdRefAng?: ST_GeomGuideName;
    minAng?: ST_AdjAngle;
    maxAng?: ST_AdjAngle;
    pos: CT_AdjPoint2D;
}

/** Position */
export interface CT_ConnectionSite {
    ang: ST_AdjAngle;
    pos: CT_AdjPoint2D;
}

/** XY Adjust Handle */
export interface CT_AdjustHandleList {
    ahXY: CT_XYAdjustHandle;
    ahPolar: CT_PolarAdjustHandle;
}

/** Shape Connection Site */
export interface CT_ConnectionSiteList {
    cxn?: CT_ConnectionSite[];
}

/** Identifier */
export interface CT_Connection {
    id: ST_DrawingElementId;
    idx: number;
}

/** Move end point */
export interface CT_Path2DMoveTo {
    pt: CT_AdjPoint2D;
}

/** Line end point */
export interface CT_Path2DLineTo {
    pt: CT_AdjPoint2D;
}

/** Shape Arc Width Radius */
export interface CT_Path2DArcTo {
    wR: ST_AdjCoordinate;
    hR: ST_AdjCoordinate;
    stAng: ST_AdjAngle;
    swAng: ST_AdjAngle;
}

/** Shape Path Point */
export interface CT_Path2DQuadBezierTo {
    pt: CT_AdjPoint2D[];
}

/** Control points and end point */
export interface CT_Path2DCubicBezierTo {
    pt: CT_AdjPoint2D[];
}

export interface CT_Path2DClose {
}

/** Close Shape Path */
export interface CT_Path2D {
    w?: ST_PositiveCoordinate;
    h?: ST_PositiveCoordinate;
    fill?: ST_PathFillMode;
    stroke?: boolean;
    extrusionOk?: boolean;
    close: CT_Path2DClose;
    moveTo: CT_Path2DMoveTo;
    lnTo: CT_Path2DLineTo;
    arcTo: CT_Path2DArcTo;
    quadBezTo: CT_Path2DQuadBezierTo;
    cubicBezTo: CT_Path2DCubicBezierTo;
}

/** Shape Path */
export interface CT_Path2DList {
    path?: CT_Path2D[];
}

/** List of Shape Adjust Values */
export interface CT_PresetGeometry2D {
    prst: ST_ShapeType;
    avLst?: CT_GeomGuideList;
}

/** Adjust Value List */
export interface CT_PresetTextShape {
    prst: ST_TextShapeType;
    avLst?: CT_GeomGuideList;
}

/** Adjust Value List */
export interface CT_CustomGeometry2D {
    avLst?: CT_GeomGuideList;
    gdLst?: CT_GeomGuideList;
    ahLst?: CT_AdjustHandleList;
    cxnLst?: CT_ConnectionSiteList;
    rect?: CT_GeomRect;
    pathLst: CT_Path2DList;
}

