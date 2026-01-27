/**
 * shared-customXmlSchemaProperties.xsd
 */

/** Custom XML Schema Namespace */
export interface CT_Schema {
  uri?: string;
  manifestLocation?: string;
  schemaLocation?: string;
}

/** Custom XML Schema Reference */
export interface CT_SchemaLibrary {
  schema?: CT_Schema[];
}
