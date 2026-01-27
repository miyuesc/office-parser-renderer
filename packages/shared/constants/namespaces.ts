export const XML_NAMESPACES = {
  // Common
  CONTENT_TYPES: 'http://schemas.openxmlformats.org/package/2006/content-types',
  RELATIONSHIPS: 'http://schemas.openxmlformats.org/package/2006/relationships',
  RELATIONSHIPS_OFFICE: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',

  // Word (DOCX)
  WORDPROCESSING_ML: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',

  // Excel (XLSX)
  SPREADSHEET_ML: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',

  // PowerPoint (PPTX)
  PRESENTATION_ML: 'http://schemas.openxmlformats.org/presentationml/2006/main',

  // DrawingML
  DRAWING_ML_MAIN: 'http://schemas.openxmlformats.org/drawingml/2006/main',
  DRAWING_ML_CHART: 'http://schemas.openxmlformats.org/drawingml/2006/chart',
  DRAWING_ML_WORDPROCESSING_DRAWING: 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
  DRAWING_ML_SPREADSHEET_DRAWING: 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing',
  DRAWING_ML_PICTURE: 'http://schemas.openxmlformats.org/drawingml/2006/picture',

  // Office Math
  OFFICE_MATH: 'http://schemas.openxmlformats.org/officeDocument/2006/math',

  // VML
  VML: 'urn:schemas-microsoft-com:vml',
  VML_OFFICE: 'urn:schemas-microsoft-com:office:office',

  // Custom Properties
  CUSTOM_PROPERTIES: 'http://schemas.openxmlformats.org/officeDocument/2006/custom-properties',
  EXTENDED_PROPERTIES: 'http://schemas.openxmlformats.org/officeDocument/2006/extended-properties',
  CORE_PROPERTIES: 'http://schemas.openxmlformats.org/package/2006/metadata/core-properties'
} as const;
