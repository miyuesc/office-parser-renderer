// import { DocxParser, DocxRenderer } from '@ai-space/docx';
import { DocxParser, DocxRenderer } from '../../docx/src/index';
import { PptxParser, PptxRenderer } from '@ai-space/pptx';
// 直接从源文件导入以便测试最新的修改
import { XlsxParser, XlsxRenderer, XlsxSheet } from '../../xlsx/src/index';
import { renderShapeGallery } from './shape-gallery';

// 引入 CSS 样式文件（替代内联样式注入）
import '../../docx/src/styles/docx.css';
import '../../xlsx/src/styles/xlsx.css';
import '../../shared/src/styles/common.css';

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
    console.log('Parsing DOCX... [HMR Trigger]');
    // const parser = new DocxParser();
    // const doc = await parser.parse(buf);
    const doc = await DocxParser.parseAsync(buf);
    console.log('DOCX AST:', doc);

    const renderer = new DocxRenderer(container, {
      enablePagination: true,
      useDocumentBackground: true,
      useDocumentWatermark: true,
      injectStyles: false, // 使用外部 CSS 文件
    });
    await renderer.render(doc);
    console.log('Render Complete');
    console.groupEnd();

    status.textContent = 'DOCX Rendered!';
  } catch (err: unknown) {
    console.error('DOCX load error:', err);
    status.textContent = 'Error: ' + (err instanceof Error ? err.message : String(err));
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

    const renderer = new XlsxRenderer(container, { injectStyles: false });
    await renderer.render(doc);
    console.log('Render Complete');
    console.groupEnd();

    status.textContent = 'XLSX Rendered!';
  } catch (err: unknown) {
    console.error('XLSX load error:', err);
    status.textContent = 'Error: ' + (err instanceof Error ? err.message : String(err));
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
fileInput.addEventListener('change', async (e) => {
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
        useDocumentWatermark: true,
        injectStyles: false, // 使用外部 CSS 文件
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

      const renderer = new XlsxRenderer(container, { injectStyles: false });
      await renderer.render(doc);
    }
    status.textContent = 'Rendered!';
  } catch (err: unknown) {
    console.error(err);
    status.textContent = 'Error: ' + (err instanceof Error ? err.message : String(err));
  }
});

// 自动加载默认测试文档
// loadDocx(TEST_DOCX_PATH);
loadXlsx(TEST_XLSX_PATH);
