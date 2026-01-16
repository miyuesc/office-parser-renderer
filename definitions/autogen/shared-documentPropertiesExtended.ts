/**
 * shared-documentPropertiesExtended.xsd
 */

/** Name of Document Template */
export interface CT_Properties {
  Template?: any;
  Manager?: any;
  Company?: any;
  Pages?: any;
  Words?: any;
  Characters?: any;
  PresentationFormat?: any;
  Lines?: any;
  Paragraphs?: any;
  Slides?: any;
  Notes?: any;
  TotalTime?: any;
  HiddenSlides?: any;
  MMClips?: any;
  ScaleCrop?: any;
  HeadingPairs?: any;
  TitlesOfParts?: any;
  LinksUpToDate?: any;
  CharactersWithSpaces?: any;
  SharedDoc?: any;
  HyperlinkBase?: any;
  HLinks?: any;
  HyperlinksChanged?: any;
  DigSig?: any;
  Application?: any;
  AppVersion?: any;
  DocSecurity?: any;
}

/** Vector */
export interface CT_VectorVariant {
  vector: any;
}

/** Vector */
export interface CT_VectorLpstr {
  vector: any;
}

/** Binary Blob */
export interface CT_DigSigBlob {
  blob: any;
}
