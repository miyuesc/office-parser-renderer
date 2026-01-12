
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
}

export interface OfficeShape {
    id: string;
    name?: string;
    type: string; // 'rect', 'ellipse', etc. (prstGeom)
    textBody?: OfficeTextBody;
    fill?: OfficeFill;
    stroke?: OfficeStroke;
    anchor: OfficeAnchor;
    rotation?: number;
    flipH?: boolean;
    flipV?: boolean;
}

export interface OfficeConnector {
    id: string;
    name?: string;
    type: string; // 'straightConnector1', 'bentConnector2', etc. (prstGeom)
    startConnection?: { id: string; idx: number };
    endConnection?: { id: string; idx: number };
    stroke?: OfficeStroke;
    anchor: OfficeAnchor;
    rotation?: number;
    flipH?: boolean;
    flipV?: boolean;
}

export interface OfficeImage {
    id: string; // r:id or unique ID
    embedId: string; // r:embed
    name?: string;
    mimeType?: string;
    data?: Uint8Array; // Resolved binary data
    anchor: OfficeAnchor;
    rotation?: number;
    flipH?: boolean;
    flipV?: boolean;
}

export interface OfficeTextBody {
    text: string;
    paragraphs: OfficeParagraph[];
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
    size?: number; // pt
    color?: string; // hex
    font?: string;
}

export interface OfficeFill {
    type: 'solid' | 'gradient' | 'pattern' | 'none';
    color?: string; // Hex (resolved)
    bgColor?: string; // For pattern fill
    patternType?: string; // For pattern fill
    opacity?: number;
}

export interface OfficeStroke {
    width?: number; // pt
    color?: string; // Hex
    dashStyle?: string; // 'solid', 'dash', 'dot', etc.
    headEnd?: { type: string; };
    tailEnd?: { type: string; };
}
