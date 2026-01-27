import { CT_ExtensionList } from './common-types';
/**
 * pml-slideSynchronizationData.xsd
 */
/** Server's Slide File ID */
export interface CT_SlideSyncProperties {
  serverSldId: string;
  serverSldModifiedTime: any;
  clientInsertedTime: any;
  extLst?: CT_ExtensionList;
}
