import { ST_CellRef, ST_Xstring } from './sml-baseTypes';

/**
 * sml-volatileDependencies.xsd
 */

/** Volatile Dependency Types */
export enum ST_VolDepType {
    /** Real Time Data */
    realTimeData = "realTimeData",
    /** OLAP Formulas */
    olapFunctions = "olapFunctions",
}

/** Volatile Dependency Value Types */
export enum ST_VolValueType {
    /** Boolean */
    b = "b",
    /** Real Number */
    n = "n",
    /** Error */
    e = "e",
    /** String */
    s = "s",
}

/** Volatile Dependency Type */
export interface CT_VolTypes {
    volType: CT_VolType[];
    extLst?: any;
}

/** Main */
export interface CT_VolType {
    type: ST_VolDepType;
    main: CT_VolMain[];
}

/** Topic */
export interface CT_VolMain {
    first: ST_Xstring;
    tp: CT_VolTopic[];
}

/** Topic Value */
export interface CT_VolTopic {
    t?: ST_VolValueType;
    v: ST_Xstring;
    stp?: ST_Xstring[];
    tr: CT_VolTopicRef[];
}

/** Reference */
export interface CT_VolTopicRef {
    r: ST_CellRef;
    s: number;
}

