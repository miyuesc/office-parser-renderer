import { XlsxParser, GridRenderer } from '@opr/xlsx';
import { Logger } from '@opr/shared';

const logger = new Logger('Playground');

const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const container = document.getElementById('container') as HTMLElement;
let renderer: GridRenderer | null = null;

fileInput.addEventListener('change', async e => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  logger.info('Loading file:', file.name);

  try {
    const buffer = await file.arrayBuffer();

    // 解析 XLSX
    const doc = await XlsxParser.parse(buffer);
    logger.info('Parsed document:', doc);

    // 获取第一个 Sheet
    if (doc.worksheets.size > 0) {
      const worksheet = doc.worksheets.values().next().value;
      if (worksheet) {
        logger.info('Rendering worksheet:', worksheet);

        // 初始化渲染器
        if (renderer) {
          renderer.destroy();
        }

        renderer = new GridRenderer(container, {
          width: container.clientWidth,
          height: container.clientHeight
        });

        renderer.setWorksheet(worksheet, doc);
      }
    } else {
      logger.warn('No worksheets found');
    }
  } catch (err) {
    logger.error('Failed to process file:', err);
    alert('Failed to process file. Check console for details.');
  }
});
