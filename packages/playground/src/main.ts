// import { DocxParser, DocxRenderer } from '@ai-space/docx';
import { DocxParser, DocxRenderer } from '../../docx/src/index';
import { PptxParser, PptxRenderer } from '@ai-space/pptx';
import { XlsxParser, XlsxRenderer } from '@ai-space/xlsx';
import { renderShapeGallery } from './shape-gallery';

const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const container = document.getElementById('container') as HTMLElement;
const status = document.getElementById('status') as HTMLSpanElement;
const galleryBtn = document.getElementById('galleryBtn') as HTMLButtonElement;
const loadDocxBtn = document.getElementById('loadDocxBtn') as HTMLButtonElement;
const loadXlsxBtn = document.getElementById('loadXlsxBtn') as HTMLButtonElement;

// 测试文档路径
const TEST_DOCX_PATH = '/' + encodeURIComponent('测试docx.docx');
const TEST_XLSX_PATH = '/' + encodeURIComponent('测试xlsx.xlsx');

/**
 * 加载并渲染 DOCX 文档
 * @param url - 文档 URL
 */
async function loadDocx(url: string) {
  status.textContent = 'Loading DOCX...';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();

    console.group('DOCX Load Process');
    console.log('Parsing DOCX... [HMR Trigger]');
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

    status.textContent = 'DOCX Rendered!';
  } catch (err: any) {
    console.error('DOCX load error:', err);
    status.textContent = 'Error: ' + err.message;
  }
}

/**
 * 加载并渲染 XLSX 文档
 * @param url - 文档 URL
 */
async function loadXlsx(url: string) {
  status.textContent = 'Loading XLSX...';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();

    console.group('XLSX Load Process');
    console.log('Parsing XLSX...');
    const parser = new XlsxParser();
    const doc = await parser.parse(buf);
    console.log('XLSX AST:', doc);

    const renderer = new XlsxRenderer(container);
    await renderer.render(doc);
    console.log('Render Complete');
    console.groupEnd();

    status.textContent = 'XLSX Rendered!';
  } catch (err: any) {
    console.error('XLSX load error:', err);
    status.textContent = 'Error: ' + err.message;
  }
}

// 快捷切换按钮事件
loadDocxBtn.addEventListener('click', () => loadDocx(TEST_DOCX_PATH));
loadXlsxBtn.addEventListener('click', () => loadXlsx(TEST_XLSX_PATH));

galleryBtn.addEventListener('click', () => {
  status.textContent = 'Rendering Shape Gallery...';
  renderShapeGallery(container);
  status.textContent = 'Gallery Loaded';
});

// 文件选择事件
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
        enablePagination: true,
        useDocumentBackground: true,
        useDocumentWatermark: true
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

// 自动加载默认测试文档 (DOCX)
loadDocx(TEST_DOCX_PATH);
