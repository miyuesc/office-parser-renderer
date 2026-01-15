/**
 * pml-baseTypes.xsd
 */

/** Name string */
export type ST_Name = string;

/** Direction */
export enum ST_Direction {
    /** Horizontal */
    horz = "horz",
    /** Vertical */
    vert = "vert",
}

/** Index */
export type ST_Index = string;

export interface CT_Empty {
}

/** Start */
export interface CT_IndexRange {
    st: ST_Index;
    end: ST_Index;
}

/** Relationship ID */
export interface CT_SlideRelationshipListEntry {
    id: string;
}

/** Presentation Slide */
export interface CT_SlideRelationshipList {
    sld?: CT_SlideRelationshipListEntry[];
}

/** Custom Show Identifier */
export interface CT_CustomShowId {
    id: number;
}

/** Relationship ID */
export interface CT_CustomerData {
    id: string;
}

/** Relationship ID */
export interface CT_TagsData {
    id: string;
}

/** Customer Data */
export interface CT_CustomerDataList {
    custData?: CT_CustomerData[];
    tags?: CT_TagsData;
}

/** Uniform Resource Identifier */
export interface CT_Extension {
    uri?: string;
}

export interface CT_ExtensionList {
    ext?: CT_Extension[];
}

/** Modify */
export interface CT_ExtensionListModify {
    mod?: boolean;
    ext?: CT_Extension[];
}

