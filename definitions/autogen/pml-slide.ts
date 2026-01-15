import { CT_AudioCD, CT_AudioFile, CT_QuickTimeFile, CT_VideoFile } from './dml-audioVideo';
import { CT_EmbeddedWAVAudioFile, CT_Transform2D, ST_BlackWhiteMode } from './dml-baseTypes';
import { CT_NonVisualConnectorProperties, CT_NonVisualDrawingProps, CT_NonVisualDrawingShapeProps, CT_NonVisualGraphicFrameProperties, CT_NonVisualGroupDrawingShapeProps, CT_NonVisualPictureProperties } from './dml-documentProperties';
import { CT_BlipFillProperties, CT_EffectContainer, CT_EffectList, CT_GradientFillProperties, CT_GroupFillProperties, CT_NoFillProperties, CT_PatternFillProperties, CT_SolidColorFillProperties } from './dml-shapeEffects';
import { CT_GroupShapeProperties, CT_ShapeProperties } from './dml-shapeProperties';
import { CT_ShapeStyle } from './dml-shapeStyle';
import { CT_ColorMapping, CT_ColorMappingOverride } from './dml-stylesheet';
import { CT_TextBody, CT_TextListStyle } from './dml-text';
import { CT_SlideTiming, CT_SlideTransition } from './pml-animationInfo';
import { CT_CustomerDataList, CT_ExtensionListModify, ST_Direction } from './pml-baseTypes';
import { CT_ControlList } from './pml-embedding';
import { CT_ExtensionList } from './sml-baseTypes';

/**
 * pml-slide.xsd
 */

/** Placeholder IDs */
export enum ST_PlaceholderType {
    /** Title */
    title = "title",
    /** Body */
    body = "body",
    /** Centered Title */
    ctrTitle = "ctrTitle",
    /** Subtitle */
    subTitle = "subTitle",
    /** Date and Time */
    dt = "dt",
    /** Slide Number */
    sldNum = "sldNum",
    /** Footer */
    ftr = "ftr",
    /** Header */
    hdr = "hdr",
    /** Object */
    obj = "obj",
    /** Chart */
    chart = "chart",
    /** Table */
    tbl = "tbl",
    /** Clip Art */
    clipArt = "clipArt",
    /** Diagram */
    dgm = "dgm",
    /** Media */
    media = "media",
    /** Slide Image */
    sldImg = "sldImg",
    /** Picture */
    pic = "pic",
}

/** Placeholder Size */
export enum ST_PlaceholderSize {
    /** Full */
    full = "full",
    /** Half */
    half = "half",
    /** Quarter */
    quarter = "quarter",
}

/** Slide Layout Type */
export enum ST_SlideLayoutType {
    /** Slide Layout Type Enumeration ( Title ) */
    title = "title",
    /** Slide Layout Type Enumeration ( Text ) */
    tx = "tx",
    /** Slide Layout Type Enumeration ( Two Column Text ) */
    twoColTx = "twoColTx",
    /** Slide Layout Type Enumeration ( Table ) */
    tbl = "tbl",
    /** Slide Layout Type Enumeration ( Text and Chart ) */
    txAndChart = "txAndChart",
    /** Slide Layout Type Enumeration ( Chart and Text ) */
    chartAndTx = "chartAndTx",
    /** Slide Layout Type Enumeration ( Diagram ) */
    dgm = "dgm",
    /** Chart */
    chart = "chart",
    /** Text and Clip Art */
    txAndClipArt = "txAndClipArt",
    /** Clip Art and Text */
    clipArtAndTx = "clipArtAndTx",
    /** Slide Layout Type Enumeration ( Title Only ) */
    titleOnly = "titleOnly",
    /** Slide Layout Type Enumeration ( Blank ) */
    blank = "blank",
    /** Slide Layout Type Enumeration ( Text and Object ) */
    txAndObj = "txAndObj",
    /** Slide Layout Type Enumeration ( Object and Text ) */
    objAndTx = "objAndTx",
    /** Object */
    objOnly = "objOnly",
    /** Title and Object */
    obj = "obj",
    /** Slide Layout Type Enumeration ( Text and Media ) */
    txAndMedia = "txAndMedia",
    /** Slide Layout Type Enumeration ( Media and Text ) */
    mediaAndTx = "mediaAndTx",
    /** Slide Layout Type Enumeration ( Object over Text) */
    objOverTx = "objOverTx",
    /** Slide Layout Type Enumeration ( Text over Object) */
    txOverObj = "txOverObj",
    /** Text and Two Objects */
    txAndTwoObj = "txAndTwoObj",
    /** Two Objects and Text */
    twoObjAndTx = "twoObjAndTx",
    /** Two Objects over Text */
    twoObjOverTx = "twoObjOverTx",
    /** Four Objects */
    fourObj = "fourObj",
    /** Vertical Text */
    vertTx = "vertTx",
    /** Clip Art and Vertical Text */
    clipArtAndVertTx = "clipArtAndVertTx",
    /** Vertical Title and Text */
    vertTitleAndTx = "vertTitleAndTx",
    /** Vertical Title and Text Over Chart */
    vertTitleAndTxOverChart = "vertTitleAndTxOverChart",
    /** Two Objects */
    twoObj = "twoObj",
    /** Object and Two Object */
    objAndTwoObj = "objAndTwoObj",
    /** Two Objects and Object */
    twoObjAndObj = "twoObjAndObj",
    /** Slide Layout Type Enumeration ( Custom ) */
    cust = "cust",
    /** Section Header */
    secHead = "secHead",
    /** Two Text and Two Objects */
    twoTxTwoObj = "twoTxTwoObj",
    /** Title, Object, and Caption */
    objTx = "objTx",
    /** Picture and Caption */
    picTx = "picTx",
}

/** Slide Layout ID */
export type ST_SlideLayoutId = number;

/** Slide Number Placeholder */
export interface CT_HeaderFooter {
    sldNum?: boolean;
    hdr?: boolean;
    ftr?: boolean;
    dt?: boolean;
    extLst?: CT_ExtensionListModify;
}

/** Placeholder Type */
export interface CT_Placeholder {
    type?: ST_PlaceholderType;
    orient?: ST_Direction;
    sz?: ST_PlaceholderSize;
    idx?: number;
    hasCustomPrompt?: boolean;
    extLst?: CT_ExtensionListModify;
}

/** Placeholder Shape */
export interface CT_ApplicationNonVisualDrawingProps {
    isPhoto?: boolean;
    userDrawn?: boolean;
    ph?: CT_Placeholder;
    audioCd?: CT_AudioCD;
    wavAudioFile?: CT_EmbeddedWAVAudioFile;
    audioFile?: CT_AudioFile;
    videoFile?: CT_VideoFile;
    quickTimeFile?: CT_QuickTimeFile;
    custDataLst?: CT_CustomerDataList;
    extLst?: CT_ExtensionList;
}

/** Non-Visual Drawing Properties */
export interface CT_ShapeNonVisual {
    cNvPr: CT_NonVisualDrawingProps;
    cNvSpPr: CT_NonVisualDrawingShapeProps;
    nvPr: CT_ApplicationNonVisualDrawingProps;
}

/** Non-Visual Properties for a Shape */
export interface CT_Shape {
    useBgFill?: boolean;
    nvSpPr: CT_ShapeNonVisual;
    spPr: CT_ShapeProperties;
    style?: CT_ShapeStyle;
    txBody?: CT_TextBody;
    extLst?: CT_ExtensionListModify;
}

/** Non-Visual Drawing Properties */
export interface CT_ConnectorNonVisual {
    cNvPr: CT_NonVisualDrawingProps;
    cNvCxnSpPr: CT_NonVisualConnectorProperties;
    nvPr: CT_ApplicationNonVisualDrawingProps;
}

/** Non-Visual Properties for a Connection Shape */
export interface CT_Connector {
    nvCxnSpPr: CT_ConnectorNonVisual;
    spPr: CT_ShapeProperties;
    style?: CT_ShapeStyle;
    extLst?: CT_ExtensionListModify;
}

/** Non-Visual Picture Drawing Properties */
export interface CT_PictureNonVisual {
    cNvPr: CT_NonVisualDrawingProps;
    cNvPicPr: CT_NonVisualPictureProperties;
    nvPr: CT_ApplicationNonVisualDrawingProps;
}

/** Non-Visual Properties for a Picture */
export interface CT_Picture {
    nvPicPr: CT_PictureNonVisual;
    blipFill: CT_BlipFillProperties;
    spPr: CT_ShapeProperties;
    style?: CT_ShapeStyle;
    extLst?: CT_ExtensionListModify;
}

/** Non-Visual Drawing Properties */
export interface CT_GraphicalObjectFrameNonVisual {
    cNvPr: CT_NonVisualDrawingProps;
    cNvGraphicFramePr: CT_NonVisualGraphicFrameProperties;
    nvPr: CT_ApplicationNonVisualDrawingProps;
}

/** Non-Visual Properties for a Graphic Frame */
export interface CT_GraphicalObjectFrame {
    nvGraphicFramePr: CT_GraphicalObjectFrameNonVisual;
    xfrm: CT_Transform2D;
    graphic: any;
    extLst?: CT_ExtensionListModify;
}

/** Non-visual Drawing Properties */
export interface CT_GroupShapeNonVisual {
    cNvPr: CT_NonVisualDrawingProps;
    cNvGrpSpPr: CT_NonVisualGroupDrawingShapeProps;
    nvPr: CT_ApplicationNonVisualDrawingProps;
}

/** Non-Visual Properties for a Group Shape */
export interface CT_GroupShape {
    nvGrpSpPr: CT_GroupShapeNonVisual;
    grpSpPr: CT_GroupShapeProperties;
    sp: CT_Shape;
    grpSp: CT_GroupShape;
    graphicFrame: CT_GraphicalObjectFrame;
    cxnSp: CT_Connector;
    pic: CT_Picture;
    extLst?: CT_ExtensionListModify;
}

/** Shade to Title */
export interface CT_BackgroundProperties {
    shadeToTitle?: boolean;
    noFill?: CT_NoFillProperties;
    solidFill?: CT_SolidColorFillProperties;
    gradFill?: CT_GradientFillProperties;
    blipFill?: CT_BlipFillProperties;
    pattFill?: CT_PatternFillProperties;
    grpFill?: CT_GroupFillProperties;
    effectLst?: CT_EffectList;
    effectDag?: CT_EffectContainer;
    extLst?: CT_ExtensionList;
}

/** Black and White Mode */
export interface CT_Background {
    bwMode?: ST_BlackWhiteMode;
}

/** Slide Background */
export interface CT_CommonSlideData {
    name?: string;
    bg?: CT_Background;
    spTree: CT_GroupShape;
    custDataLst?: CT_CustomerDataList;
    controls?: CT_ControlList;
    extLst?: CT_ExtensionList;
}

/** Common slide data for slides */
export interface CT_Slide {
    show?: boolean;
    cSld: CT_CommonSlideData;
    clrMapOvr?: CT_ColorMappingOverride;
    transition?: CT_SlideTransition;
    timing?: CT_SlideTiming;
    extLst?: CT_ExtensionListModify;
}

/** Common slide data for slide layouts */
export interface CT_SlideLayout {
    matchingName?: string;
    type?: ST_SlideLayoutType;
    preserve?: boolean;
    userDrawn?: boolean;
    cSld: CT_CommonSlideData;
    clrMapOvr?: CT_ColorMappingOverride;
    transition?: CT_SlideTransition;
    timing?: CT_SlideTiming;
    hf?: CT_HeaderFooter;
    extLst?: CT_ExtensionListModify;
}

/** Slide Master Title Text Style */
export interface CT_SlideMasterTextStyles {
    titleStyle?: CT_TextListStyle;
    bodyStyle?: CT_TextListStyle;
    otherStyle?: CT_TextListStyle;
    extLst?: CT_ExtensionList;
}

/** ID Tag */
export interface CT_SlideLayoutIdListEntry {
    id?: ST_SlideLayoutId | string;
    extLst?: CT_ExtensionList;
}

/** Slide Layout Id */
export interface CT_SlideLayoutIdList {
    sldLayoutId?: CT_SlideLayoutIdListEntry[];
}

/** Common slide data for slide masters */
export interface CT_SlideMaster {
    preserve?: boolean;
    cSld: CT_CommonSlideData;
    clrMap: CT_ColorMapping;
    sldLayoutIdLst?: CT_SlideLayoutIdList;
    transition?: CT_SlideTransition;
    timing?: CT_SlideTiming;
    hf?: CT_HeaderFooter;
    txStyles?: CT_SlideMasterTextStyles;
    extLst?: CT_ExtensionListModify;
}

/** Common slide data for handout master */
export interface CT_HandoutMaster {
    cSld: CT_CommonSlideData;
    clrMap: CT_ColorMapping;
    hf?: CT_HeaderFooter;
    extLst?: CT_ExtensionListModify;
}

/** Common Slide Data */
export interface CT_NotesMaster {
    cSld: CT_CommonSlideData;
    clrMap: CT_ColorMapping;
    hf?: CT_HeaderFooter;
    notesStyle?: CT_TextListStyle;
    extLst?: CT_ExtensionListModify;
}

/** Common slide data for notes slides */
export interface CT_NotesSlide {
    cSld: CT_CommonSlideData;
    clrMapOvr?: CT_ColorMappingOverride;
    extLst?: CT_ExtensionListModify;
}

