import { ST_CellRef } from './sml-baseTypes';

/**
 * sml-calculationChain.xsd
 */

/** Cell */
export interface CT_CalcChain {
    c: CT_CalcCell[];
    extLst?: any;
}

/** Cell Reference */
export interface CT_CalcCell {
    r: ST_CellRef;
    i?: number;
    s?: boolean;
    l?: boolean;
    t?: boolean;
    a?: boolean;
}

