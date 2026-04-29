import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { PackageReader } from '../../ooxml';
import { MediaRegistry } from '../MediaRegistry';

describe('MediaRegistry', () => {
  it('should register internal media, external hyperlinks, and bookmarks', async () => {
    const zip = new JSZip();

    zip.file(
      '[Content_Types].xml',
      `
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="xml" ContentType="application/xml"/>
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="png" ContentType="image/png"/>
        </Types>
      `
    );
    zip.folder('word')!.file('document.xml', '<document/>');
    zip.folder('word')!.folder('_rels')!.file(
      'document.xml.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rIdImage" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>
          <Relationship Id="rIdLink" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com" TargetMode="External"/>
        </Relationships>
      `
    );
    zip.folder('word')!.folder('media')!.file('image1.png', new Uint8Array([1, 2, 3]));

    const pkg = await PackageReader.load(await zip.generateAsync({ type: 'arraybuffer' }));
    const registry = new MediaRegistry(pkg);
    const image = registry.resolveRelationship('word/document.xml', 'rIdImage');
    const hyperlink = registry.resolveRelationship('word/document.xml', 'rIdLink');
    const bookmark = registry.registerBookmark('bookmark1', 'Intro', 'word/document.xml#bookmark1');

    expect(image).toMatchObject({
      id: 'rIdImage',
      kind: 'image',
      path: 'word/media/image1.png',
      extension: 'png',
      contentType: 'image/png'
    });
    expect(image?.data).toEqual(new Uint8Array([1, 2, 3]));
    expect(hyperlink).toMatchObject({
      id: 'rIdLink',
      kind: 'hyperlink',
      target: 'https://example.com',
      targetMode: 'External'
    });
    expect(bookmark).toMatchObject({
      id: 'bookmark1',
      kind: 'bookmark',
      name: 'Intro'
    });
    expect(registry.listResources()).toHaveLength(2);
    expect(registry.listHyperlinks()).toHaveLength(1);
    expect(registry.listBookmarks()).toHaveLength(1);
  });
});
