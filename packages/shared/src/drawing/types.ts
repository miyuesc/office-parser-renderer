
export interface OfficeAnchor {
    type: 'absolute' | 'oneCell' | 'twoCell';
    from: {
        col: number;
        colOff: number; // EMU
        row: number;
        rowOff: number; // EMU
    };
    to: {
        col: number;
        colOff: number; // EMU
        row: number;
        rowOff: number; // EMU
    };
    ext?: {
        cx: number;
        cy: number;
    }
}

export interface OfficeShape {
    id: string;
    name?: string;
    type: string; // 'rect', 'ellipse', etc. (prstGeom) or 'custom'
    textBody?: OfficeTextBody;
    fill?: OfficeFill;
    stroke?: OfficeStroke;
    anchor: OfficeAnchor;
    rotation?: number;
    flipH?: boolean;
    flipV?: boolean;
    geometry?: string; // prstGeom type
    path?: string; // SVG Path 'd' for custGeom
    effects?: OfficeEffect[];
}

export interface OfficeConnector {
    id: string;
    name?: string;
    type: string; 
    startConnection?: { id: string; idx: number };
    endConnection?: { id: string; idx: number };
    stroke?: OfficeStroke;
    anchor: OfficeAnchor;
    rotation?: number;
    flipH?: boolean;
    flipV?: boolean;
    startArrow?: string;
    endArrow?: string;
}

export interface OfficeImage {
    id: string; 
    embedId: string; 
    name?: string;
    mimeType?: string;
    data?: Uint8Array; 
    anchor: OfficeAnchor;
    rotation?: number;
    flipH?: boolean;
    flipV?: boolean;
    src: string;
}

export interface OfficeTextBody {
    text: string;
    paragraphs: OfficeParagraph[];
    verticalOverflow?: 'overflow' | 'ellipsis' | 'clip';
    horizontalOverflow?: 'overflow' | 'ellipsis' | 'clip';
}

export interface OfficeParagraph {
    text: string;
    alignment?: 'left' | 'center' | 'right' | 'justify';
    runs: OfficeRun[];
}

export interface OfficeRun {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: string; // 'sng' | 'dbl' etc
    strike?: string; // 'sngStrike' | 'noStrike'
    size?: number; // pt
    color?: string; // hex
    fill?: OfficeFill; // Text fill (can be gradient)
    font?: string;
    effects?: OfficeEffect[];
    baseline?: number; // Percentage
}

export interface OfficeFill {
    type: 'solid' | 'gradient' | 'pattern' | 'none';
    color?: string; // Hex (resolved) for solid
    gradient?: OfficeGradient;
    pattern?: OfficePattern;
    opacity?: number;
}

export interface OfficeGradient {
    type: 'linear' | 'path'; // lin | path
    angle?: number; // for linear, degrees
    path?: string; // for path (shape, rect, circle)
    stops: Array<{
        position: number; // 0-1
        color: string;
    }>;
}

export interface OfficePattern {
    patternType: string;
    fgColor: string;
    bgColor: string;
}

export interface OfficeStroke {
    width?: number; // pt
    color?: string; // Hex
    dashStyle?: string; // 'solid', 'dash', 'dot', etc.
    headEnd?: { type: string; };
    tailEnd?: { type: string; };
    join?: 'round' | 'bevel' | 'miter';
    cap?: 'rnd' | 'sq' | 'flat';
}

export interface OfficeEffect {
    type: 'outerShadow' | 'innerShadow' | 'glow' | 'reflection' | 'softEdge';
    // Shadow props
    blur?: number; // pt
    dist?: number; // pt
    dir?: number; // degrees
    color?: string;
    alpha?: number; // 0-1
    // Glow props
    radius?: number; // pt
}
