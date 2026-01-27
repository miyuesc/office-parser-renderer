export interface PptxDocument {
  slides: Slide[];
  theme: Record<string, unknown>;
  images: Record<string, string>;
}

export interface Slide {
  id: string;
  elements: SlideElement[];
}

export type SlideElement = Shape | Picture | TextBox;

export interface Shape {
  type: 'shape';
  geometry: string; // preset geometry
  props: ShapeProperties;
}

export interface Picture {
  type: 'picture';
  image: {
    src: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface TextBox {
  type: 'textbox';
  text: string;
  props: ShapeProperties;
}

export interface ShapeProperties {
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  outline?: string;
}
