/**
 * Office Open XML Enumerations
 */

/**
 * Preset Geometry Types (a:prstGeom)
 * ECMA-376 20.1.10.51 ST_ShapeType
 */
export enum PrstGeom {
    Rect = 'rect',
    RoundRect = 'roundRect',
    Round2SameRect = 'round2SameRect',
    BentConnector2 = 'bentConnector2',
    CurvedConnector3 = 'curvedConnector3',
    Line = 'line',
    Triangle = 'triangle',
    Ellipse = 'ellipse',
    // Add more as needed
}

/**
 * Line End Types (Head/Tail)
 * ECMA-376 20.1.10.33 ST_LineEndType
 */
export enum LineEndType {
    None = 'none',
    Triangle = 'triangle',
    Stealth = 'stealth',
    Diamond = 'diamond',
    Oval = 'oval',
    Arrow = 'arrow'
}

/**
 * Line End Width
 * ECMA-376 20.1.10.34 ST_LineEndWidth
 */
export enum LineEndWidth {
    Small = 'sm',
    Medium = 'med',
    Large = 'lg'
}

/**
 * Line End Length
 * ECMA-376 20.1.10.35 ST_LineEndLength
 */
export enum LineEndLength {
    Small = 'sm',
    Medium = 'med',
    Large = 'lg'
}

/**
 * Pattern Fill Types
 * ECMA-376 20.1.10.43 ST_PresetPatternVal
 */
export enum PatternType {
    DkUpDiag = 'dkUpDiag',
    DkDnDiag = 'dkDnDiag',
    DkHorz = 'dkHorz',
    DkVert = 'dkVert',
    LtUpDiag = 'ltUpDiag',
    LtDnDiag = 'ltDnDiag',
    LtHorz = 'ltHorz',
    LtVert = 'ltVert',
    Pct5 = 'pct5',
    Pct10 = 'pct10',
    Pct20 = 'pct20',
    Pct25 = 'pct25',
    Pct30 = 'pct30',
    Pct40 = 'pct40',
    Pct50 = 'pct50',
    Pct60 = 'pct60',
    Pct70 = 'pct70',
    Pct75 = 'pct75',
    Pct80 = 'pct80',
    Pct90 = 'pct90',
    // ... others
}
