import { CT_ExtensionList, ST_Xstring } from './sml-baseTypes';

/**
 * sml-queryTable.xsd
 */

/** Grow Shrink Type */
export enum ST_GrowShrinkType {
    /** Insert &amp; Delete On Refresh */
    insertDelete = "insertDelete",
    /** Insert &amp; Clear On Refresh */
    insertClear = "insertClear",
    /** Overwrite &amp; Clear On Refresh */
    overwriteClear = "overwriteClear",
}

/** QueryTable Refresh Information */
export interface CT_QueryTable {
    name: ST_Xstring;
    headers?: boolean;
    rowNumbers?: boolean;
    disableRefresh?: boolean;
    backgroundRefresh?: boolean;
    firstBackgroundRefresh?: boolean;
    refreshOnLoad?: boolean;
    growShrinkType?: ST_GrowShrinkType;
    fillFormulas?: boolean;
    removeDataOnSave?: boolean;
    disableEdit?: boolean;
    preserveFormatting?: boolean;
    adjustColumnWidth?: boolean;
    intermediate?: boolean;
    connectionId: number;
    queryTableRefresh?: CT_QueryTableRefresh;
    extLst?: CT_ExtensionList;
}

/** Query table fields */
export interface CT_QueryTableRefresh {
    preserveSortFilterLayout?: boolean;
    fieldIdWrapped?: boolean;
    headersInLastRefresh?: boolean;
    minimumVersion?: number;
    nextId?: number;
    unboundColumnsLeft?: number;
    unboundColumnsRight?: number;
    queryTableFields: CT_QueryTableFields;
    queryTableDeletedFields?: CT_QueryTableDeletedFields;
    sortState?: any;
    extLst?: any;
}

/** Deleted Field */
export interface CT_QueryTableDeletedFields {
    count?: number;
    deletedField: CT_DeletedField[];
}

/** Deleted Fields Name */
export interface CT_DeletedField {
    name: ST_Xstring;
}

/** QueryTable Field */
export interface CT_QueryTableFields {
    count?: number;
    queryTableField?: CT_QueryTableField[];
}

/** Future Feature Data Storage Area */
export interface CT_QueryTableField {
    id: number;
    name?: ST_Xstring;
    dataBound?: boolean;
    rowNumbers?: boolean;
    fillFormulas?: boolean;
    clipped?: boolean;
    tableColumnId?: number;
    extLst?: CT_ExtensionList;
}

