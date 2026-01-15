import { CT_Point2D, CT_PositiveSize2D, CT_Scale2D, ST_Coordinate32, ST_PositiveFixedPercentage } from './dml-baseTypes';
import { ST_Direction } from './pml-baseTypes';
import { CT_ExtensionList } from './sml-baseTypes';

/**
 * pml-viewProperties.xsd
 */

/** Splitter Bar State */
export enum ST_SplitterBarState {
    /** Min */
    minimized = "minimized",
    /** Restored */
    restored = "restored",
    /** Max */
    maximized = "maximized",
}

/** List of View Types */
export enum ST_ViewType {
    /** Normal Slide View */
    sldView = "sldView",
    /** Slide Master View */
    sldMasterView = "sldMasterView",
    /** Notes View */
    notesView = "notesView",
    /** Handout View */
    handoutView = "handoutView",
    /** Notes Master View */
    notesMasterView = "notesMasterView",
    /** Outline View */
    outlineView = "outlineView",
    /** Slide Sorter View */
    sldSorterView = "sldSorterView",
    /** Slide Thumbnail View */
    sldThumbnailView = "sldThumbnailView",
}

/** Normal View Dimension Size */
export interface CT_NormalViewPortion {
    sz: ST_PositiveFixedPercentage;
    autoAdjust?: boolean;
}

/** Normal View Restored Left Properties */
export interface CT_NormalViewProperties {
    showOutlineIcons?: boolean;
    snapVertSplitter?: boolean;
    vertBarState?: ST_SplitterBarState;
    horzBarState?: ST_SplitterBarState;
    preferSingleView?: boolean;
    restoredLeft: CT_NormalViewPortion;
    restoredTop: CT_NormalViewPortion;
    extLst?: CT_ExtensionList;
}

/** View Scale */
export interface CT_CommonViewProperties {
    varScale?: boolean;
    scale: CT_Scale2D;
    origin: CT_Point2D;
}

/** Base properties for Notes View */
export interface CT_NotesTextViewProperties {
    cViewPr: CT_CommonViewProperties;
    extLst?: CT_ExtensionList;
}

/** Relationship Identifier */
export interface CT_OutlineViewSlideEntry {
    id: string;
    collapse?: boolean;
}

/** Presentation Slide */
export interface CT_OutlineViewSlideList {
    sld?: CT_OutlineViewSlideEntry[];
}

/** Common View Properties */
export interface CT_OutlineViewProperties {
    cViewPr: CT_CommonViewProperties;
    sldLst?: CT_OutlineViewSlideList;
    extLst?: CT_ExtensionList;
}

/** Base properties for Slide Sorter View */
export interface CT_SlideSorterViewProperties {
    showFormatting?: boolean;
    cViewPr: CT_CommonViewProperties;
    extLst?: CT_ExtensionList;
}

/** Guide Orientation */
export interface CT_Guide {
    orient?: ST_Direction;
    pos?: ST_Coordinate32;
}

/** A Guide */
export interface CT_GuideList {
    guide?: CT_Guide[];
}

/** Base properties for Slide View */
export interface CT_CommonSlideViewProperties {
    snapToGrid?: boolean;
    snapToObjects?: boolean;
    showGuides?: boolean;
    cViewPr: CT_CommonViewProperties;
    guideLst?: CT_GuideList;
}

export interface CT_SlideViewProperties {
    cSldViewPr: CT_CommonSlideViewProperties;
    extLst?: CT_ExtensionList;
}

/** Common Slide View Properties */
export interface CT_NotesViewProperties {
    cSldViewPr: CT_CommonSlideViewProperties;
    extLst?: CT_ExtensionList;
}

/** Normal View Properties */
export interface CT_ViewProperties {
    lastView?: ST_ViewType;
    showComments?: boolean;
    normalViewPr?: CT_NormalViewProperties;
    slideViewPr?: CT_SlideViewProperties;
    outlineViewPr?: CT_OutlineViewProperties;
    notesTextViewPr?: CT_NotesTextViewProperties;
    sorterViewPr?: CT_SlideSorterViewProperties;
    notesViewPr?: CT_NotesViewProperties;
    gridSpacing?: CT_PositiveSize2D;
    extLst?: CT_ExtensionList;
}

