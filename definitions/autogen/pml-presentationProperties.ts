import { CT_ColorMRU } from './dml-baseTypes';
import { CT_ExtensionList } from './sml-baseTypes';
import { CT_Color } from './wml';

/**
 * pml-presentationProperties.xsd
 */

/** Web browsers supported for HTML output */
export enum ST_HtmlPublishWebBrowserSupport {
  /** Browser v4 */
  v4 = 'v4',
  /** Browser v3 */
  v3 = 'v3',
  /** Browser v3v4 */
  v3v4 = 'v3v4'
}

/** HTML Slide Navigation Control Colors */
export enum ST_WebColorType {
  /** Non-specific Colors */
  none = 'none',
  /** Browser Colors */
  browser = 'browser',
  /** Presentation Text Colors */
  presentationText = 'presentationText',
  /** Presentation Accent Colors */
  presentationAccent = 'presentationAccent',
  /** White Text on Black Colors */
  whiteTextOnBlack = 'whiteTextOnBlack',
  /** Black Text on White Colors */
  blackTextOnWhite = 'blackTextOnWhite'
}

/** HTML/Web Screen Size Target */
export enum ST_WebScreenSize {
  /** HTML/Web Size Enumeration 544x376 */
  _544x376 = '544x376',
  /** HTML/Web Size Enumeration 640x480 */
  _640x480 = '640x480',
  /** HTML/Web Size Enumeration 720x515 */
  _720x512 = '720x512',
  /** HTML/Web Size Enumeration 800x600 */
  _800x600 = '800x600',
  /** HTML/Web Size Enumeration 1024x768 */
  _1024x768 = '1024x768',
  /** HTML/Web Size Enumeration 1152x882 */
  _1152x882 = '1152x882',
  /** HTML/Web Size Enumeration 1152x900 */
  _1152x900 = '1152x900',
  /** HTML/Web Size Enumeration 1280x1024 */
  _1280x1024 = '1280x1024',
  /** HTML/Web Size Enumeration 1600x1200 */
  _1600x1200 = '1600x1200',
  /** HTML/Web Size Enumeration 1800x1400 */
  _1800x1400 = '1800x1400',
  /** HTML/Web Size Enumeration 1920x1200 */
  _1920x1200 = '1920x1200'
}

/** Web Encoding */
export type ST_WebEncoding = string;

/** Default print output */
export enum ST_PrintWhat {
  /** Slides */
  slides = 'slides',
  /** 1 Slide / Handout Page */
  handouts1 = 'handouts1',
  /** 2 Slides / Handout Page */
  handouts2 = 'handouts2',
  /** 3 Slides / Handout Page */
  handouts3 = 'handouts3',
  /** 4 Slides / Handout Page */
  handouts4 = 'handouts4',
  /** 6 Slides / Handout Page */
  handouts6 = 'handouts6',
  /** 9 Slides / Handout Page */
  handouts9 = 'handouts9',
  /** Notes */
  notes = 'notes',
  /** Outline */
  outline = 'outline'
}

/** Print Color Mode */
export enum ST_PrintColorMode {
  /** Black and White Mode */
  bw = 'bw',
  /** Grayscale Mode */
  gray = 'gray',
  /** Color Mode */
  clr = 'clr'
}

/** Show Speaker Notes */
export interface CT_HtmlPublishProperties {
  showSpeakerNotes?: boolean;
  pubBrowser?: ST_HtmlPublishWebBrowserSupport;
  title?: string;
  id: string;
  extLst?: CT_ExtensionList;
}

/** Show animation in HTML output */
export interface CT_WebProperties {
  showAnimation?: boolean;
  resizeGraphics?: boolean;
  allowPng?: boolean;
  relyOnVml?: boolean;
  organizeInFolders?: boolean;
  useLongFilenames?: boolean;
  imgSz?: ST_WebScreenSize;
  encoding?: ST_WebEncoding;
  clr?: ST_WebColorType;
  extLst?: CT_ExtensionList;
}

/** Print Output */
export interface CT_PrintProperties {
  prnWhat?: ST_PrintWhat;
  clrMode?: ST_PrintColorMode;
  hiddenSlides?: boolean;
  scaleToFitPaper?: boolean;
  frameSlides?: boolean;
  extLst?: CT_ExtensionList;
}

/** Show Scroll Bar in Window */
export interface CT_ShowInfoBrowse {
  showScrollbar?: boolean;
}

/** Restart Show */
export interface CT_ShowInfoKiosk {
  restart?: number;
}

/** Pen Color for Slide Show */
export interface CT_ShowProperties {
  loop?: boolean;
  showNarration?: boolean;
  showAnimation?: boolean;
  useTimings?: boolean;
  penClr?: CT_Color;
  extLst?: CT_ExtensionList;
}

/** HTML Publishing Properties */
export interface CT_PresentationProperties {
  htmlPubPr?: CT_HtmlPublishProperties;
  webPr?: CT_WebProperties;
  prnPr?: CT_PrintProperties;
  showPr?: CT_ShowProperties;
  clrMru?: CT_ColorMRU;
  extLst?: CT_ExtensionList;
}
