import { ST_Guid } from './common-types';
/**
 * shared-customXmlDataProperties.xsd
 */

/** 128-Bit GUID Value */

/** Target Namespace of Associated XML Schema */
export interface CT_DatastoreSchemaRef {
  uri: string;
}

/** Associated XML Schema */
export interface CT_DatastoreSchemaRefs {
  schemaRef?: CT_DatastoreSchemaRef[];
}

/** Set of Associated XML Schemas */
export interface CT_DatastoreItem {
  itemID: ST_Guid;
  schemaRefs?: CT_DatastoreSchemaRefs;
}
