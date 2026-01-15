import { CT_PositiveSize2D, ST_Percentage, ST_PositiveCoordinate32 } from './dml-baseTypes';
import { CT_TextListStyle } from './dml-text';
import { CT_TextFont } from './dml-textCharacter';
import { CT_CustomerDataList, CT_SlideRelationshipList, ST_Name } from './pml-baseTypes';
import { CT_ExtensionList } from './sml-baseTypes';

/**
 * pml-presentation.xsd
 */

/** Slide Identifier */
export type ST_SlideId = number;

/** Slide Master ID */
export type ST_SlideMasterId = number;

/** Photo Album Layout Definition */
export enum ST_PhotoAlbumLayout {
    /** Fit Photos to Slide */
    fitToSlide = "fitToSlide",
    /** 1 Photo per Slide */
    _1pic = "1pic",
    /** 2 Photos per Slide */
    _2pic = "2pic",
    /** 4 Photos per Slide */
    _4pic = "4pic",
    /** 1 Photo per Slide with Titles */
    _1picTitle = "1picTitle",
    /** 2 Photos per Slide with Titles */
    _2picTitle = "2picTitle",
    /** 4 Photos per Slide with Titles */
    _4picTitle = "4picTitle",
}

/** Photo Album Shape for Photo Mask */
export enum ST_PhotoAlbumFrameShape {
    /** Rectangle Photo Frame */
    frameStyle1 = "frameStyle1",
    /** Rounded Rectangle Photo Frame */
    frameStyle2 = "frameStyle2",
    /** Simple White Photo Frame */
    frameStyle3 = "frameStyle3",
    /** Simple Black Photo Frame */
    frameStyle4 = "frameStyle4",
    /** Compound Black Photo Frame */
    frameStyle5 = "frameStyle5",
    /** Center Shadow Photo Frame */
    frameStyle6 = "frameStyle6",
    /** Soft Edge Photo Frame */
    frameStyle7 = "frameStyle7",
}

/** Slide Size Coordinate */
export type ST_SlideSizeCoordinate = ST_PositiveCoordinate32;

/** Slide Size Type */
export enum ST_SlideSizeType {
    /** Screen 4x3 */
    screen4x3 = "screen4x3",
    /** Letter */
    letter = "letter",
    /** A4 */
    A4 = "A4",
    /** 35mm Film */
    _35mm = "35mm",
    /** Overhead */
    overhead = "overhead",
    /** Banner */
    banner = "banner",
    /** Custom */
    custom = "custom",
    /** Ledger */
    ledger = "ledger",
    /** A3 */
    A3 = "A3",
    /** B4ISO */
    B4ISO = "B4ISO",
    /** B5ISO */
    B5ISO = "B5ISO",
    /** B4JIS */
    B4JIS = "B4JIS",
    /** B5JIS */
    B5JIS = "B5JIS",
    /** Hagaki Card */
    hagakiCard = "hagakiCard",
    /** Screen 16x9 */
    screen16x9 = "screen16x9",
    /** Screen 16x10 */
    screen16x10 = "screen16x10",
}

/** Bookmark ID Seed */
export type ST_BookmarkIdSeed = number;

/** Cryptographic Provider Type */
export enum ST_CryptProv {
    /** RSA AES Encryption Scheme */
    rsaAES = "rsaAES",
    /** RSA Full Encryption Scheme */
    rsaFull = "rsaFull",
    /** Invalid Encryption Scheme */
    invalid = "invalid",
}

/** Cryptographic Algorithm Classes */
export enum ST_AlgClass {
    /** Hash Algorithm Class */
    hash = "hash",
    /** Invalid Algorithm Class */
    invalid = "invalid",
}

/** Cryptographic Algorithm Type */
export enum ST_AlgType {
    /** Any Algorithm Type */
    typeAny = "typeAny",
    /** Invalid Algorithm Type */
    invalid = "invalid",
}

/** Slide Identifier */
export interface CT_SlideIdListEntry {
    id?: ST_SlideId | string;
    extLst?: CT_ExtensionList;
}

/** Slide ID */
export interface CT_SlideIdList {
    sldId?: CT_SlideIdListEntry[];
}

/** Slide Master Identifier */
export interface CT_SlideMasterIdListEntry {
    id?: ST_SlideMasterId | string;
    extLst?: CT_ExtensionList;
}

/** Slide Master ID */
export interface CT_SlideMasterIdList {
    sldMasterId?: CT_SlideMasterIdListEntry[];
}

/** Relationship Identifier */
export interface CT_NotesMasterIdListEntry {
    id: string;
    extLst?: CT_ExtensionList;
}

/** Notes Master ID */
export interface CT_NotesMasterIdList {
    notesMasterId?: CT_NotesMasterIdListEntry;
}

/** Relationship Identifier */
export interface CT_HandoutMasterIdListEntry {
    id: string;
    extLst?: CT_ExtensionList;
}

/** Handout Master ID */
export interface CT_HandoutMasterIdList {
    handoutMasterId?: CT_HandoutMasterIdListEntry;
}

/** Relationship Identifier */
export interface CT_EmbeddedFontDataId {
    id: string;
}

/** Embedded Font Name */
export interface CT_EmbeddedFontListEntry {
    font: CT_TextFont;
    regular?: CT_EmbeddedFontDataId;
    bold?: CT_EmbeddedFontDataId;
    italic?: CT_EmbeddedFontDataId;
    boldItalic?: CT_EmbeddedFontDataId;
}

/** Embedded Font */
export interface CT_EmbeddedFontList {
    embeddedFont?: CT_EmbeddedFontListEntry[];
}

/** Relationship Identifier */
export interface CT_SmartTags {
    id: string;
}

/** List of Presentation Slides */
export interface CT_CustomShow {
    name: ST_Name;
    id: number;
    sldLst: CT_SlideRelationshipList;
    extLst?: CT_ExtensionList;
}

/** Custom Show */
export interface CT_CustomShowList {
    custShow?: CT_CustomShow[];
}

/** Black and White */
export interface CT_PhotoAlbum {
    bw?: boolean;
    showCaptions?: boolean;
    layout?: ST_PhotoAlbumLayout;
    frame?: ST_PhotoAlbumFrameShape;
    extLst?: CT_ExtensionList;
}

/** Extent Length */
export interface CT_SlideSize {
    cx: ST_SlideSizeCoordinate;
    cy: ST_SlideSizeCoordinate;
    type?: ST_SlideSizeType;
}

/** Language */
export interface CT_Kinsoku {
    lang?: string;
    invalStChars: string;
    invalEndChars: string;
}

/** Cryptographic Provider Type */
export interface CT_ModifyVerifier {
    cryptProviderType: ST_CryptProv;
    cryptAlgorithmClass: ST_AlgClass;
    cryptAlgorithmType: ST_AlgType;
    cryptAlgorithmSid: number;
    spinCount: number;
    saltData: string;
    hashData: string;
    cryptProvider?: string;
    algIdExt?: number;
    algIdExtSource?: string;
    cryptProviderTypeExt?: number;
    cryptProviderTypeExtSource?: string;
}

/** List of Slide Master IDs */
export interface CT_Presentation {
    serverZoom?: ST_Percentage;
    firstSlideNum?: number;
    showSpecialPlsOnTitleSld?: boolean;
    rtl?: boolean;
    removePersonalInfoOnSave?: boolean;
    compatMode?: boolean;
    strictFirstAndLastChars?: boolean;
    embedTrueTypeFonts?: boolean;
    saveSubsetFonts?: boolean;
    autoCompressPictures?: boolean;
    bookmarkIdSeed?: ST_BookmarkIdSeed;
    sldMasterIdLst?: CT_SlideMasterIdList;
    notesMasterIdLst?: CT_NotesMasterIdList;
    handoutMasterIdLst?: CT_HandoutMasterIdList;
    sldIdLst?: CT_SlideIdList;
    sldSz?: CT_SlideSize;
    notesSz: CT_PositiveSize2D;
    smartTags?: CT_SmartTags;
    embeddedFontLst?: CT_EmbeddedFontList;
    custShowLst?: CT_CustomShowList;
    photoAlbum?: CT_PhotoAlbum;
    custDataLst?: CT_CustomerDataList;
    kinsoku?: CT_Kinsoku;
    defaultTextStyle?: CT_TextListStyle;
    modifyVerifier?: CT_ModifyVerifier;
    extLst?: CT_ExtensionList;
}

