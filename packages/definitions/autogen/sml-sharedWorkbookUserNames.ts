import { ST_Guid, ST_Xstring } from './common-types';
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
