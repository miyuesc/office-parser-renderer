import { ST_Xstring } from './sml-baseTypes';
import { ST_Guid } from './wml';

/**
 * sml-sharedWorkbookUserNames.xsd
 */

/** User Information */
export interface CT_Users {
    count?: number;
    userInfo?: any[];
}

/** User Revisions GUID */
export interface CT_SharedUser {
    guid: ST_Guid;
    name: ST_Xstring;
    id: number;
    dateTime: any;
    extLst?: any;
}

