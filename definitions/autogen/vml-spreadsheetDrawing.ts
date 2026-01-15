/**
 * vml-spreadsheetDrawing.xsd
 */

/** Clipboard Format Type */
export enum ST_CF {
    /** WMF */
    PictOld = "PictOld",
    /** EMF */
    Pict = "Pict",
    /** Bitmap */
    Bitmap = "Bitmap",
    /** Printer Picture */
    PictPrint = "PictPrint",
    /** Screen Picture EMF */
    PictScreen = "PictScreen",
}

/** Object Type */
export enum ST_ObjectType {
    /** Pushbutton */
    Button = "Button",
    /** Checkbox */
    Checkbox = "Checkbox",
    /** Dialog */
    Dialog = "Dialog",
    /** Dropdown Box */
    Drop = "Drop",
    /** Editable Text Field */
    Edit = "Edit",
    /** Group Box */
    GBox = "GBox",
    /** Label */
    Label = "Label",
    /** Auditing Line */
    LineA = "LineA",
    /** List Box */
    List = "List",
    /** Movie */
    Movie = "Movie",
    /** Comment */
    Note = "Note",
    /** Image */
    Pict = "Pict",
    /** Radio Button */
    Radio = "Radio",
    /** Auditing Rectangle */
    RectA = "RectA",
    /** Scroll Bar */
    Scroll = "Scroll",
    /** Spin Button */
    Spin = "Spin",
    /** Plain Shape */
    Shape = "Shape",
    /** Group */
    Group = "Group",
    /** Plain Rectangle */
    Rect = "Rect",
}

/** Boolean Value with Blank State */
export enum ST_TrueFalseBlank {
    /** Logical True */
    True = "True",
    /** Logical True */
    t = "t",
    /** Logical False */
    False = "False",
    /** Logical False */
    f = "f",
}

/** Move with Cells */
export interface CT_ClientData {
    ObjectType: ST_ObjectType;
    MoveWithCells: ST_TrueFalseBlank;
    SizeWithCells: ST_TrueFalseBlank;
    Anchor: string;
    Locked: ST_TrueFalseBlank;
    DefaultSize: ST_TrueFalseBlank;
    PrintObject: ST_TrueFalseBlank;
    Disabled: ST_TrueFalseBlank;
    AutoFill: ST_TrueFalseBlank;
    AutoLine: ST_TrueFalseBlank;
    AutoPict: ST_TrueFalseBlank;
    FmlaMacro: string;
    TextHAlign: string;
    TextVAlign: string;
    LockText: ST_TrueFalseBlank;
    JustLastX: ST_TrueFalseBlank;
    SecretEdit: ST_TrueFalseBlank;
    Default: ST_TrueFalseBlank;
    Help: ST_TrueFalseBlank;
    Cancel: ST_TrueFalseBlank;
    Dismiss: ST_TrueFalseBlank;
    Accel: number;
    Accel2: number;
    Row: number;
    Column: number;
    Visible: ST_TrueFalseBlank;
    RowHidden: ST_TrueFalseBlank;
    ColHidden: ST_TrueFalseBlank;
    VTEdit: number;
    MultiLine: ST_TrueFalseBlank;
    VScroll: ST_TrueFalseBlank;
    ValidIds: ST_TrueFalseBlank;
    FmlaRange: string;
    WidthMin: number;
    Sel: number;
    NoThreeD2: ST_TrueFalseBlank;
    SelType: string;
    MultiSel: string;
    LCT: string;
    ListItem: string;
    DropStyle: string;
    Colored: ST_TrueFalseBlank;
    DropLines: number;
    Checked: number;
    FmlaLink: string;
    FmlaPict: string;
    NoThreeD: ST_TrueFalseBlank;
    FirstButton: ST_TrueFalseBlank;
    FmlaGroup: string;
    Val: number;
    Min: number;
    Max: number;
    Inc: number;
    Page: number;
    Horiz: ST_TrueFalseBlank;
    Dx: number;
    MapOCX: ST_TrueFalseBlank;
    CF: ST_CF;
    Camera: ST_TrueFalseBlank;
    RecalcAlways: ST_TrueFalseBlank;
    AutoScale: ST_TrueFalseBlank;
    DDE: ST_TrueFalseBlank;
    UIObj: ST_TrueFalseBlank;
    ScriptText: string;
    ScriptExtended: string;
    ScriptLanguage: any;
    ScriptLocation: any;
    FmlaTxbx: string;
}

