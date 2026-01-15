/**
 * sml-customXmlMappings.xsd
 */

/** XML Schema */
export interface CT_MapInfo {
    SelectionNamespaces: string;
    Schema: CT_Schema[];
    Map: CT_Map[];
}

/** Schema ID */
export interface CT_Schema {
    ID: string;
    SchemaRef?: string;
    Namespace?: string;
}

/** XML Mapping */
export interface CT_Map {
    ID: number;
    Name: string;
    RootElement: string;
    SchemaID: string;
    ShowImportExportValidationErrors: boolean;
    AutoFit: boolean;
    Append: boolean;
    PreserveSortAFLayout: boolean;
    PreserveFormat: boolean;
    DataBinding?: CT_DataBinding;
}

/** Unique Identifer */
export interface CT_DataBinding {
    DataBindingName?: string;
    FileBinding?: boolean;
    ConnectionID?: number;
    FileBindingName?: string;
    DataBindingLoadMode: number;
}

