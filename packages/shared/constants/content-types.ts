export const CONTENT_TYPES = {
  // Main Documents
  WORD_DOCUMENT: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml',
  WORD_TEMPLATE: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml',
  SPREADSHEET_WORKBOOK: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml',
  SPREADSHEET_TEMPLATE: 'application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml',
  PRESENTATION_MAIN: 'application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml',
  PRESENTATION_TEMPLATE: 'application/vnd.openxmlformats-officedocument.presentationml.template.main+xml',
  PRESENTATION_SLIDESHOW: 'application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml',

  // Parts
  STYLES: 'application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml',
  NUMBERING: 'application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml',
  HEADER: 'application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml',
  FOOTER: 'application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml',
  THEME: 'application/vnd.openxmlformats-officedocument.theme+xml',
  CORE_PROPERTIES: 'application/vnd.openxmlformats-package.core-properties+xml',
  EXTENDED_PROPERTIES: 'application/vnd.openxmlformats-officedocument.extended-properties+xml',
  CUSTOM_PROPERTIES: 'application/vnd.openxmlformats-officedocument.custom-properties+xml',

  // Spreadsheet Parts
  WORKSHEET: 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml',
  SHARED_STRINGS: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml',
  CALC_CHAIN: 'application/vnd.openxmlformats-officedocument.spreadsheetml.calcChain+xml',

  // Presentation Parts
  SLIDE: 'application/vnd.openxmlformats-officedocument.presentationml.slide+xml',
  SLIDE_LAYOUT: 'application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml',
  SLIDE_MASTER: 'application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml',
  NOTES_SLIDE: 'application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml',
  NOTES_MASTER: 'application/vnd.openxmlformats-officedocument.presentationml.notesMaster+xml',
  HANDOUT_MASTER: 'application/vnd.openxmlformats-officedocument.presentationml.handoutMaster+xml',

  // Media
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  GIF: 'image/gif',
  TIFF: 'image/tiff',
  BMP: 'image/bmp',
  SVG: 'image/svg+xml',
  EMF: 'image/x-emf',
  WMF: 'image/x-wmf'
} as const;
