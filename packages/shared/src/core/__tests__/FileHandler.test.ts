import { describe, it, expect } from 'vitest';
import { FileHandler } from '../FileHandler';
import JSZip from 'jszip';

describe('FileHandler', () => {
  it('should unzip files correctly', async () => {
    // 创建一个模拟的 ZIP 文件
    const zip = new JSZip();
    zip.file('hello.txt', 'Hello World');
    zip.folder('subdir')!.file('test.xml', '<root>test</root>');

    const buffer = await zip.generateAsync({ type: 'arraybuffer' });

    const files = await FileHandler.unzip(buffer);

    expect(files.has('hello.txt')).toBe(true);
    expect(FileHandler.readText(files.get('hello.txt')!)).toBe('Hello World');

    expect(files.has('subdir/test.xml')).toBe(true);
    expect(FileHandler.readText(files.get('subdir/test.xml')!)).toBe('<root>test</root>');
  });

  it('should parse XML correctly', () => {
    const xml = '<root><child attr="val">Content</child></root>';
    const doc = FileHandler.parseXML(xml);

    expect(doc.documentElement.tagName).toBe('root');
    expect(doc.querySelector('child')!.textContent).toBe('Content');
    expect(doc.querySelector('child')!.getAttribute('attr')).toBe('val');
  });
});
