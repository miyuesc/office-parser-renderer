// Mock dependencies
vi.mock('@ai-space/shared', () => ({
  ZipService: {
    load: vi.fn(),
  },
}));

vi.mock('../../src/utils/Logger', () => ({
  Logger: {
    createTagged: () => ({
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
    }),
    group: vi.fn(),
    groupEnd: vi.fn(),
    time: vi.fn(),
    timeEnd: vi.fn(),
  },
}));

// Mock other parsers to simplify test
vi.mock('../../src/parser/RelationshipsParser', () => ({
  RelationshipsParser: {
    parsePackageRels: vi.fn(() => []),
    parseDocumentRels: vi.fn(() => []),
    parseFileRels: vi.fn(() => []),
    filterByType: vi.fn(() => []),
    resolveTarget: vi.fn((base, target) => target),
    TYPES: {
      HEADER: 'header',
      FOOTER: 'footer',
      IMAGE: 'image',
      OFFICE_DOCUMENT: 'officeDocument',
    },
  },
}));

vi.mock('../../src/parser/StylesParser', () => ({
  StylesParser: {
    parseFromFiles: vi.fn(() => ({ styles: {} })),
  },
}));

vi.mock('../../src/parser/DocumentParser', () => ({
  DocumentParser: {
    parseFromFiles: vi.fn(() => ({ body: [], sections: [], lastSection: {} })),
    extractText: vi.fn(() => ''),
  },
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocxParser } from '../../src/parser/DocxParser';
import { ZipService } from '@ai-space/shared';

describe('DocxParser', () => {
  let parser: DocxParser;

  beforeEach(() => {
    parser = new DocxParser();
    vi.clearAllMocks();
  });

  it('should parse a valid array buffer', async () => {
    const mockBuffer = new ArrayBuffer(10);
    const mockFiles = {
      'word/document.xml': new Uint8Array([60, 63]), // <?
    };

    // Setup ZipService mock
    (ZipService.load as any).mockResolvedValue(mockFiles);

    const result = await parser.parse(mockBuffer);

    expect(ZipService.load).toHaveBeenCalledWith(mockBuffer);
    expect(result).toBeDefined();
    expect(result.body).toEqual([]);
  });

  it('should extract text', async () => {
    // Mock DocumentParser.extractText just for this test?
    // Or just check if it calls parse.
    // Let's just check normalized input handling indirectly via parse success
    const mockUint8 = new Uint8Array(10);
    (ZipService.load as any).mockResolvedValue({});

    await parser.extractText(mockUint8);
    expect(ZipService.load).toHaveBeenCalled();
  });
});
