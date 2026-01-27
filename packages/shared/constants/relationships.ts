export const RELATIONSHIP_TYPES = {
  // Common
  OFFICE_DOCUMENT: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
  CORE_PROPERTIES: 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
  EXTENDED_PROPERTIES: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties',
  CUSTOM_PROPERTIES: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties',
  THEME: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
  IMAGE: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
  HYPERLINK: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',

  // Word (DOCX)
  STYLES: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
  NUMBERING: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering',
  HEADER: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header',
  FOOTER: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer',
  SETTINGS: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings',
  WEB_SETTINGS: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings',
  FONT_TABLE: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable',

  // Excel (XLSX)
  WORKSHEET: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',
  SHARED_STRINGS: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',
  CALC_CHAIN: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/calcChain',
  STYLES_SHEET: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',

  // PowerPoint (PPTX)
  SLIDE: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide',
  SLIDE_LAYOUT: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout',
  SLIDE_MASTER: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster',
  NOTES_SLIDE: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide',
  NOTES_MASTER: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster',
  HANDOUT_MASTER: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/handoutMaster',
  PRES_PROPS: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps',
  VIEW_PROPS: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/viewProps'
} as const;
