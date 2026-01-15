/**
 * shared-additionalCharacteristics.xsd
 */

/** Characteristic Relationship Types */
export enum ST_Relation {
    /** Greater Than or Equal to */
    ge = "ge",
    /** Less Than or Equal To */
    le = "le",
    /** Greater Than */
    gt = "gt",
    /** Less Than */
    lt = "lt",
    /** Equal To */
    eq = "eq",
}

/** Single Characteristic */
export interface CT_AdditionalCharacteristics {
    characteristic?: CT_Characteristic[];
}

/** Name of Characteristic */
export interface CT_Characteristic {
    name: string;
    relation: ST_Relation;
    val: string;
    vocabulary?: string;
}

