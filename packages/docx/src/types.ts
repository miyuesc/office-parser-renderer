export interface DocxDocument {
    body: DocxElement[];
    styles: any;
    numbering: any;
    relationships: Record<string, string>;
    images: Record<string, string>; // Path -> Blob URL
}

export type DocxElement = Paragraph | Table | Drawing;

// ... Paragraph ...

export interface Drawing {
    type: 'drawing';
    image?: {
        src: string; // Blob URL or internal path
        width: number;
        height: number;
    };
}

export interface Paragraph {
    type: 'paragraph';
    props: ParagraphProperties;
    children: (Run | Drawing)[];
}

export interface ParagraphProperties {
    alignment?: 'left' | 'center' | 'right' | 'both';
    indentation?: { left: number; right: number; firstLine: number };
    numbering?: { id: number; level: number };
}

export interface Run {
    type: 'run';
    props: RunProperties;
    text: string;
}

export interface RunProperties {
    bold?: boolean;
    italic?: boolean;
    size?: number;
    font?: string;
    color?: string;
}

export interface Table {
    type: 'table';
    rows: TableRow[];
    props: TableProperties;
    grid: number[]; // Column widths in pixels
}

export interface TableProperties {
    width?: { value: number; type: 'dxa' | 'pct' | 'auto' };
    borders?: any; // To be expanded
}

export interface TableRow {
    type: 'row';
    cells: TableCell[];
    props: {
        height?: number;
    };
}

export interface TableCell {
    type: 'cell';
    children: DocxElement[];
    props: {
        width?: number; // Preference
        gridSpan?: number; // Colspan
        vMerge?: 'restart' | 'continue';
    };
}

export interface NumberingDefinition {
    abstractNums: Record<string, AbstractNumbering>; // id -> AbstractNumbering
    nums: Record<string, NumberingInstance>; // id -> NumberingInstance
}

export interface AbstractNumbering {
    id: string;
    levels: Record<string, NumberingLevel>; // levelIndex -> Level
}

export interface NumberingLevel {
    start: number;
    format: string; // decimal, bullet, etc.
    text: string; // "%1."
    alignment: 'left' | 'center' | 'right';
    indent: number; // Left indentation in pixels (approx)
}

export interface NumberingInstance {
    id: string;
    abstractNumId: string;
}
