export interface PptxDocument {
  sourcePartPath: string;
  slides: PptxSlide[];
  slideMasters: PptxSlideMaster[];
  slideLayouts: PptxSlideLayout[];
  theme?: PptxThemeRef;
}

export interface PptxSlide {
  id: string;
  relationshipId?: string;
  path: string;
  name?: string;
  layoutPath?: string;
  elements: PptxElement[];
}

export interface PptxSlideMaster {
  path: string;
  layoutPaths: string[];
  themePath?: string;
}

export interface PptxSlideLayout {
  path: string;
  name?: string;
  masterPath?: string;
}

export interface PptxThemeRef {
  path: string;
  name?: string;
}

export type PptxElement = PptxTextBox;

export interface PptxTextBox {
  type: 'text';
  id?: string;
  name?: string;
  text: string;
}
