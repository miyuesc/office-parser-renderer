import { ST_Direction } from './pml-baseTypes';

/**
 * dml-diagramLayoutVariables.xsd
 */

/** Number of Nodes Definition */
export type ST_NodeCount = number;

/** Show Organization Chart User Interface Value */
export interface CT_OrgChart {
    val?: boolean;
}

/** Maximum Children Value */
export interface CT_ChildMax {
    val?: ST_NodeCount;
}

/** Preferred Number of CHildren Value */
export interface CT_ChildPref {
    val?: ST_NodeCount;
}

/** Show Insert Bullet Value */
export interface CT_BulletEnabled {
    val?: boolean;
}

/** Diagram Direction Value */
export interface CT_Direction {
    val?: ST_Direction;
}

/** Organization Chart Branch Style Value */
export interface CT_HierBranchStyle {
    val?: ST_HierBranchStyle;
}

/** One By One Animation Value */
export interface CT_AnimOne {
    val?: ST_AnimOneStr;
}

/** Level Animation Value */
export interface CT_AnimLvl {
    val?: ST_AnimLvlStr;
}

/** Shape Resize Style Type */
export interface CT_ResizeHandles {
    val?: ST_ResizeHandlesStr;
}

/** Show Organization Chart User Interface */
export interface CT_LayoutVariablePropertySet {
    orgChart?: CT_OrgChart;
    chMax?: CT_ChildMax;
    chPref?: CT_ChildPref;
    bulletEnabled?: CT_BulletEnabled;
    dir?: CT_Direction;
    hierBranch?: CT_HierBranchStyle;
    animOne?: CT_AnimOne;
    animLvl?: CT_AnimLvl;
    resizeHandles?: CT_ResizeHandles;
}


// Fallback definitions for missing types
export type ST_AnimLvlStr = any;
export type ST_AnimOneStr = any;
export type ST_HierBranchStyle = any;
export type ST_ResizeHandlesStr = any;
