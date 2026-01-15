/**
 * pml-userDefinedTags.xsd
 */

/** Name */
export interface CT_StringTag {
    name?: string;
    val?: string;
}

/** Programmable Extensibility Tag */
export interface CT_TagList {
    tag?: CT_StringTag[];
}

