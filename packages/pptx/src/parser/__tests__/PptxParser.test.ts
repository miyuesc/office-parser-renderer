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

  it('should expose PPTX render options and switch slide preview/current slide', () => {
    const doc = {
      sourcePartPath: 'ppt/presentation.xml',
      slides: [
        { id: '1', path: 'ppt/slides/slide1.xml', name: 'One', elements: [{ type: 'text', text: 'First' }] },
        { id: '2', path: 'ppt/slides/slide2.xml', name: 'Two', elements: [{ type: 'text', text: 'Second' }] }
      ],
      slideMasters: [],
      slideLayouts: []
    } as any;
    const container = document.createElement('div');
    const renderer = new PptxRenderer(container, {
      currentSlide: 1,
      showSlidePreviewList: true,
      showSlideNumber: true
    });

    renderer.render(doc);

    expect(renderer.getCurrentSlideIndex()).toBe(1);
    expect(container.querySelector('[data-testid="pptx-slide-preview-list"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="pptx-slide-number"]')?.textContent).toBe('2 / 2');
    expect(container.textContent).toContain('Second');

    renderer.setCurrentSlide(0);
    expect(renderer.getRenderOptions()).toMatchObject({ currentSlide: 0, showSlidePreviewList: true });
    expect(container.textContent).toContain('First');

    renderer.setShowSlidePreviewList(false);
    expect(container.querySelector('[data-testid="pptx-slide-preview-list"]')).toBeNull();
  });
});
