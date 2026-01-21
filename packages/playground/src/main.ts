import { DocxParser, DocxRenderer } from '@ai-space/docx';
import { PptxParser, PptxRenderer } from '@ai-space/pptx';
import { XlsxParser, XlsxRenderer } from '@ai-space/xlsx';
import { renderShapeGallery } from './shape-gallery';

const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const container = document.getElementById('container') as HTMLElement;
const status = document.getElementById('status') as HTMLSpanElement;
const galleryBtn = document.getElementById('galleryBtn') as HTMLButtonElement;

galleryBtn.addEventListener('click', () => {
  status.textContent = 'Rendering Shape Gallery...';
  renderShapeGallery(container);
  status.textContent = 'Gallery Loaded';
});

fileInput.addEventListener('change', async e => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const arrayBuffer = await file.arrayBuffer();
  const name = file.name.toLowerCase();

  status.textContent = 'Parsing...';
  try {
    if (name.endsWith('.docx')) {
      const parser = new DocxParser();
      const doc = await parser.parse(arrayBuffer);
      console.log('DOCX AST:', doc);

      const renderer = new DocxRenderer(container, {
        enablePagination: true, // 启用分页
        useDocumentBackground: true, // 默认使用文档解析的背景色
        useDocumentWatermark: true // 默认使用文档解析的水印
      });
      await renderer.render(doc);
    } else if (name.endsWith('.pptx')) {
      const parser = new PptxParser();
      const doc = await parser.parse(arrayBuffer);
      console.log('PPTX AST:', doc);

      const renderer = new PptxRenderer(container);
      await renderer.render(doc);
    } else if (name.endsWith('.xlsx')) {
      const parser = new XlsxParser();
      const doc = await parser.parse(arrayBuffer);
      console.log('XLSX AST:', doc);

      const renderer = new XlsxRenderer(container);
      await renderer.render(doc);

      // Sheet Switcher
      if (doc.sheets && doc.sheets.length > 1) {
        const controls = document.createElement('div');
        controls.style.marginBottom = '10px';

        doc.sheets.forEach((sheet, index) => {
          const btn = document.createElement('button');
          btn.textContent = sheet.name || `Sheet ${index + 1}`;
          btn.style.marginRight = '5px';
          btn.onclick = () => {
            renderer.render(doc);
          };
          controls.appendChild(btn);
        });

        container.parentElement?.insertBefore(controls, container);
      }
    }
    status.textContent = 'Rendered!';
  } catch (err: any) {
    console.error(err);
    status.textContent = 'Error: ' + err.message;
  }
});

// Auto-load test file
(async () => {
  try {
    console.log('Fetching test file...');
    // 1. xlsx (uncomment to test xlsx)
    // const res = await fetch('/' + encodeURIComponent('测试xlsx.xlsx'));
    // if (res.ok) {
    //   const buf = await res.arrayBuffer();
    //   const { XlsxParser, XlsxRenderer } = await import('@ai-space/xlsx');
    //   console.group('Auto-Load Process');
    //   console.log('Parsing XLSX...');
    //   const parser = new XlsxParser();
    //   const doc = await parser.parse(buf);
    //   console.log('XLSX AST:', doc);
    //   const renderer = new XlsxRenderer(container);
    //   await renderer.render(doc);
    //   console.log('Render Complete');
    //   console.groupEnd();
    // }

    // 2. docx
    const res = await fetch('/' + encodeURIComponent('测试docx.docx'));
    if (res.ok) {
      const buf = await res.arrayBuffer();
      const { DocxParser, DocxRenderer } = await import('@ai-space/docx');

      console.group('Auto-Load Process');
      console.log('Parsing DOCX...');
      const parser = new DocxParser();
      const doc = await parser.parse(buf);
      console.log('DOCX AST:', doc);

      const renderer = new DocxRenderer(container, {
        enablePagination: true,
        useDocumentBackground: true,
        useDocumentWatermark: true
      });
      await renderer.render(doc);
      console.log('Render Complete');
      console.groupEnd();
    } else {
      console.error('Failed to fetch /测试docx.docx', res.status, res.statusText);
    }
  } catch (e) {
    console.error('Auto-load failed', e);
  }
})();
