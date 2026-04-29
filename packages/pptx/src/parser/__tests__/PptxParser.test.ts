import { describe, expect, it } from 'vitest';
import { loadSampleCase } from '../../../../../samples/utils/SampleCaseLoader';
import { PptxRenderer } from '../../renderer';
import { PptxParser } from '../PptxParser';

describe('PptxParser', () => {
  it('should parse slide list, master, layout, theme, and render a static slide', async () => {
    const sample = loadSampleCase('samples/pptx/masters-and-layouts/basic-master-inheritance');
    const doc = await PptxParser.parse(sample.sourceBuffer);
    const container = document.createElement('div');
    const renderer = new PptxRenderer(container);

    renderer.render(doc);

    expect(sample.metadata.id).toBe('pptx-basic-master-inheritance');
    expect(doc.sourcePartPath).toBe('ppt/presentation.xml');
    expect(doc.slides).toHaveLength(1);
    expect(doc.slides[0]).toMatchObject({
      id: '256',
      path: 'ppt/slides/slide1.xml',
      layoutPath: 'ppt/slideLayouts/slideLayout1.xml',
      elements: [{ type: 'text', text: 'PPTX Foundation' }]
    });
    expect(doc.slideMasters[0]).toMatchObject({
      path: 'ppt/slideMasters/slideMaster1.xml',
      layoutPaths: ['ppt/slideLayouts/slideLayout1.xml'],
      themePath: 'ppt/theme/theme1.xml'
    });
    expect(doc.slideLayouts[0]).toMatchObject({
      path: 'ppt/slideLayouts/slideLayout1.xml',
      name: 'Title Slide'
    });
    expect(doc.theme).toEqual({
      path: 'ppt/theme/theme1.xml',
      name: 'PPTX Theme'
    });
    expect(container.querySelector('[data-testid="pptx-slide"]')?.textContent).toContain('PPTX Foundation');

    renderer.jumpToSlide(0);
    expect(renderer.getCurrentSlideIndex()).toBe(0);
  });
});
