<template>
  <div class="playground">
    <!-- 顶部控制栏 -->
    <header class="header">
      <h1 class="title">Office Parser Renderer</h1>
      <div class="file-controls">
        <span class="format-badge">{{ formatLabel }}</span>
        <input
          type="file"
          ref="fileInputRef"
          accept=".docx,.pptx,.xlsx"
          @change="handleFileChange"
          class="file-input"
        />
        <button class="btn btn-primary" @click="loadTestXlsx">测试 XLSX</button>
        <button class="btn btn-primary" @click="loadTestDocx">测试 DOCX</button>
      </div>
    </header>

    <!-- 工具栏 -->
    <div class="toolbar" v-if="currentFormat === 'xlsx'">
      <!-- 冻结控制 -->
      <div class="toolbar-group">
        <span class="toolbar-label">冻结窗格:</span>
        <label class="checkbox-label">
          <input type="checkbox" v-model="renderFrozenRows" @change="updateRenderOptions" />
          冻结行
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="renderFrozenCols" @change="updateRenderOptions" />
          冻结列
        </label>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 行/列标号 -->
      <div class="toolbar-group">
        <span class="toolbar-label">标号:</span>
        <label class="checkbox-label">
          <input type="checkbox" v-model="showRowHeaders" @change="updateRenderOptions" />
          行号
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="showColHeaders" @change="updateRenderOptions" />
          列号
        </label>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 滚动定位 -->
      <div class="toolbar-group">
        <span class="toolbar-label">滚动到:</span>
        <input
          type="number"
          v-model.number="scrollRow"
          placeholder="行"
          class="input-number"
          min="1"
        />
        <input
          type="number"
          v-model.number="scrollCol"
          placeholder="列"
          class="input-number"
          min="1"
        />
        <button class="btn btn-secondary" @click="handleScrollTo">定位</button>
        <input
          type="text"
          v-model.trim="scrollCellRef"
          placeholder="A1"
          class="input-cell-ref"
          data-testid="scroll-cell-ref"
        />
        <button class="btn btn-secondary" data-testid="scroll-cell-button" @click="handleScrollToCellRef">
          定位单元格
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 缩放控制 -->
      <div class="toolbar-group">
        <span class="toolbar-label">缩放:</span>
        <button class="btn btn-icon" @click="handleZoom(0.5)">50%</button>
        <button class="btn btn-icon" @click="handleZoom(0.75)">75%</button>
        <button class="btn btn-icon" @click="handleZoom(1.0)">100%</button>
        <button class="btn btn-icon" @click="handleZoom(1.5)">150%</button>
        <button class="btn btn-icon" @click="handleZoom(2.0)">200%</button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 单元格信息 -->
      <div class="toolbar-group">
        <span class="toolbar-label">查询单元格:</span>
        <input
          type="number"
          v-model.number="cellRow"
          placeholder="行"
          class="input-number"
          min="1"
        />
        <input
          type="number"
          v-model.number="cellCol"
          placeholder="列"
          class="input-number"
          min="1"
        />
        <button class="btn btn-secondary" @click="handleGetCellInfo">获取信息</button>
        <input
          type="text"
          v-model.trim="cellRef"
          placeholder="A1"
          class="input-cell-ref"
          data-testid="query-cell-ref"
        />
        <button class="btn btn-secondary" data-testid="query-cell-button" @click="handleGetCellByRef">
          查询引用
        </button>
      </div>
    </div>

    <div class="toolbar" v-if="currentFormat === 'docx'">
      <div class="toolbar-group">
        <span class="toolbar-label">缩放:</span>
        <button class="btn btn-icon" @click="handleDocxZoom(Math.max(0.25, docxZoom - 0.1))">-</button>
        <button class="btn btn-icon" @click="handleDocxZoom(0.75)">75%</button>
        <button class="btn btn-icon" @click="handleDocxZoom(1)">100%</button>
        <button class="btn btn-icon" @click="handleDocxZoom(1.25)">125%</button>
        <button class="btn btn-icon" @click="handleDocxZoom(1.5)">150%</button>
        <button class="btn btn-icon" @click="handleDocxZoom(2)">200%</button>
        <button class="btn btn-icon" @click="handleDocxZoom(Math.min(3, docxZoom + 0.1))">+</button>
        <span class="toolbar-value">{{ Math.round(docxZoom * 100) }}%</span>
      </div>
    </div>

    <!-- 单元格信息展示 -->
    <div v-if="statusMessage" class="status-panel" data-testid="status-panel">
      {{ statusMessage }}
    </div>

    <div v-if="currentFormat === 'xlsx' && (cellInfo || accessInfo)" class="cell-info-panel" data-testid="cell-info-panel">
      <div v-if="accessInfo" class="cell-info-grid">
        <span>请求</span>
        <strong>({{ accessInfo.requestedRow }}, {{ accessInfo.requestedCol }})</strong>
        <span>实际</span>
        <strong>({{ accessInfo.row }}, {{ accessInfo.col }})</strong>
        <span>合并</span>
        <strong>{{ accessInfo.isMerged ? accessInfo.mergeInfo?.ref || '是' : '否' }}</strong>
        <span>值</span>
        <strong data-testid="cell-access-value">{{ accessInfo.cell?.value ?? '(空)' }}</strong>
      </div>

      <div v-else-if="cellInfo" class="cell-info-grid">
        <span>单元格</span>
        <strong>({{ cellInfo.row }}, {{ cellInfo.col }})</strong>
        <span>值</span>
        <strong>{{ cellInfo.cell?.value ?? '(空)' }}</strong>
        <span>位置</span>
        <strong>({{ cellInfo.screenBounds.x.toFixed(0) }}, {{ cellInfo.screenBounds.y.toFixed(0) }})</strong>
        <span>尺寸</span>
        <strong>{{ cellInfo.screenBounds.width.toFixed(0) }} * {{ cellInfo.screenBounds.height.toFixed(0) }}</strong>
      </div>
    </div>

    <!-- 渲染容器 -->
    <div class="render-area">
      <div ref="containerRef" class="render-container" data-testid="render-container"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { XlsxParser, XlsxRenderer, type WorksheetCellAccess } from '@opr/xlsx';
import { DocxParser, DocxRenderer, type DocxDocument } from '@opr/docx';
import { PptxParser, PptxRenderer, type PptxDocument } from '@opr/pptx';
import { Logger } from '@opr/shared';

const logger = new Logger('Playground');

// Refs
const fileInputRef = ref<HTMLInputElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);

type OfficeFormat = 'xlsx' | 'docx' | 'pptx' | 'unknown';
type ParsedOfficeDocument =
  | { format: 'xlsx'; fileName: string; doc: Awaited<ReturnType<typeof XlsxParser.parse>> }
  | { format: 'docx'; fileName: string; doc: DocxDocument }
  | { format: 'pptx'; fileName: string; doc: PptxDocument };

// Renderer 实例
let xlsxRenderer: XlsxRenderer | null = null;
let docxRenderer: DocxRenderer | null = null;
let pptxRenderer: PptxRenderer | null = null;

// 冻结控制
const renderFrozenRows = ref(true);
const renderFrozenCols = ref(true);

// 行/列标号
const showRowHeaders = ref(true);
const showColHeaders = ref(true);

// 滚动定位
const scrollRow = ref<number | undefined>(undefined);
const scrollCol = ref<number | undefined>(undefined);
const scrollCellRef = ref('');

// 单元格查询
const cellRow = ref<number | undefined>(undefined);
const cellCol = ref<number | undefined>(undefined);
const cellRef = ref('');
const cellInfo = ref<ReturnType<XlsxRenderer['getCellInfo']>>(null);
const accessInfo = ref<WorksheetCellAccess | undefined>(undefined);
const currentFormat = ref<OfficeFormat>('unknown');
const statusMessage = ref('');
const formatLabel = ref('未加载');
const docxZoom = ref(1);

// 当前文档（用于重新创建渲染器）
let currentDoc: ParsedOfficeDocument | null = null;

/**
 * 处理文件选择
 */
async function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  logger.info('Loading file:', file.name);

  try {
    const parsed = await parseOfficeFile(file);
    logger.info('Parsed document:', parsed);

    currentDoc = parsed;
    renderDocument(parsed);
  } catch (err) {
    logger.error('Failed to process file:', err);
    alert('文件处理失败，请查看控制台。');
  }
}

/**
 * 加载测试 XLSX 文件
 */
async function loadTestXlsx() {
  try {
    const response = await fetch('./测试xlsx.xlsx');
    const buffer = await response.arrayBuffer();
    const doc = await XlsxParser.parse(buffer);

    currentDoc = { format: 'xlsx', fileName: '测试xlsx.xlsx', doc };
    renderDocument(currentDoc);
  } catch (err) {
    logger.error('Failed to load test xlsx:', err);
    alert('测试文件加载失败。');
  }
}

/**
 * 加载测试 DOCX 文件
 */
async function loadTestDocx() {
  try {
    const response = await fetch('./测试docx.docx');
    const buffer = await response.arrayBuffer();
    const doc = await DocxParser.parse(buffer);

    currentDoc = { format: 'docx', fileName: '测试docx.docx', doc };
    renderDocument(currentDoc);
  } catch (err) {
    logger.error('Failed to load test xlsx:', err);
    alert('测试文件加载失败。');
  }
}

/**
 * 渲染文档
 */
async function parseOfficeFile(file: File): Promise<ParsedOfficeDocument> {
  const buffer = await file.arrayBuffer();
  const format = detectFormat(file.name);

  if (format === 'xlsx') {
    return { format, fileName: file.name, doc: await XlsxParser.parse(buffer) };
  }
  if (format === 'docx') {
    return { format, fileName: file.name, doc: await DocxParser.parse(buffer) };
  }
  if (format === 'pptx') {
    return { format, fileName: file.name, doc: await PptxParser.parse(buffer) };
  }

  throw new Error(`Unsupported file type: ${file.name}`);
}

function detectFormat(fileName: string): OfficeFormat {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'xlsx' || ext === 'docx' || ext === 'pptx') {
    return ext;
  }

  return 'unknown';
}

function renderDocument(parsed: ParsedOfficeDocument) {
  if (!containerRef.value) return;
  resetRenderState();
  currentFormat.value = parsed.format;
  formatLabel.value = parsed.format.toUpperCase();
  containerRef.value.dataset.format = parsed.format;

  if (parsed.format === 'xlsx') {
    renderXlsxDocument(parsed);
  } else if (parsed.format === 'docx') {
    renderDocxDocument(parsed);
  } else {
    renderPptxDocument(parsed);
  }
}

function renderXlsxDocument(parsed: Extract<ParsedOfficeDocument, { format: 'xlsx' }>) {
  if (!containerRef.value) return;
  const doc = parsed.doc;

  if (doc.worksheets.size > 0) {
    const worksheet = doc.worksheets.values().next().value;
    if (worksheet) {
      logger.info('Rendering worksheet:', worksheet);

      xlsxRenderer = new XlsxRenderer(containerRef.value, {
        width: containerRef.value.clientWidth,
        height: containerRef.value.clientHeight,
        renderFrozenRows: renderFrozenRows.value,
        renderFrozenCols: renderFrozenCols.value,
        showRowHeaders: showRowHeaders.value,
        showColHeaders: showColHeaders.value
      });

      xlsxRenderer.setWorksheet(worksheet, doc);
      statusMessage.value = `${parsed.fileName} · ${doc.worksheets.size} 个工作表`;
      (window as any).__oprPlayground = { renderer: xlsxRenderer, currentDoc: doc, format: 'xlsx' };
    }
  } else {
    logger.warn('No worksheets found');
    statusMessage.value = `${parsed.fileName} · 未解析到工作表`;
  }
}

function renderDocxDocument(parsed: Extract<ParsedOfficeDocument, { format: 'docx' }>) {
  if (!containerRef.value) return;

  docxRenderer = new DocxRenderer(containerRef.value, {
    width: Math.min(containerRef.value.clientWidth - 40, 816),
    zoom: docxZoom.value,
    showNavigationPane: true
  });
  docxRenderer.render(parsed.doc);
  const stats = docxRenderer.getStats();
  statusMessage.value = `${parsed.fileName} · 共 ${stats.totalPages} 页 · ${parsed.doc.body.length} 个内容块 · ${
    parsed.doc.sections.length || 1
  } 个节`;
  (window as any).__oprPlayground = { renderer: docxRenderer, currentDoc: parsed.doc, format: 'docx' };
}

function renderPptxDocument(parsed: Extract<ParsedOfficeDocument, { format: 'pptx' }>) {
  if (!containerRef.value) return;

  pptxRenderer = new PptxRenderer(containerRef.value);
  pptxRenderer.render(parsed.doc);
  statusMessage.value = `${parsed.fileName} · ${parsed.doc.slides.length} 张幻灯片`;
  (window as any).__oprPlayground = { renderer: pptxRenderer, currentDoc: parsed.doc, format: 'pptx' };
}

function resetRenderState() {
  if (xlsxRenderer) {
    xlsxRenderer.destroy();
    xlsxRenderer = null;
  }
  if (docxRenderer) {
    docxRenderer.destroy();
  }
  docxRenderer = null;
  pptxRenderer = null;
  cellInfo.value = null;
  accessInfo.value = undefined;
  statusMessage.value = '';
  if (containerRef.value) {
    containerRef.value.innerHTML = '';
    containerRef.value.className = 'render-container';
    containerRef.value.removeAttribute('style');
    delete containerRef.value.dataset.format;
  }
}

/**
 * 更新渲染选项（需要重新创建渲染器）
 */
function updateRenderOptions() {
  if (currentDoc) {
    renderDocument(currentDoc);
  }
}

/**
 * 滚动到指定行/列
 */
function handleScrollTo() {
  if (!xlsxRenderer) {
    alert('请先加载文件');
    return;
  }

  if (scrollRow.value && scrollCol.value) {
    xlsxRenderer.scrollToCell(scrollRow.value, scrollCol.value);
  } else if (scrollRow.value) {
    xlsxRenderer.scrollToRow(scrollRow.value);
  } else if (scrollCol.value) {
    xlsxRenderer.scrollToCol(scrollCol.value);
  }
}

function handleScrollToCellRef() {
  if (!xlsxRenderer) {
    alert('请先加载文件');
    return;
  }

  if (!scrollCellRef.value) {
    alert('请输入单元格引用，例如 A1');
    return;
  }

  xlsxRenderer.scrollToCell(scrollCellRef.value);
}

/**
 * 缩放
 */
function handleZoom(scale: number) {
  if (!xlsxRenderer) {
    alert('请先加载文件');
    return;
  }

  xlsxRenderer.zoomTo(scale);
}

function handleDocxZoom(scale: number) {
  docxZoom.value = scale;
  if (docxRenderer) {
    docxZoom.value = docxRenderer.zoomTo(scale);
  } else if (currentDoc?.format === 'docx') {
    renderDocument(currentDoc);
  }
}

function handleDocxZoomChange(event: Event) {
  const zoom = (event as CustomEvent<{ zoom?: number }>).detail?.zoom;
  if (typeof zoom === 'number') {
    docxZoom.value = zoom;
  }
}

/**
 * 获取单元格信息
 */
function handleGetCellInfo() {
  if (!xlsxRenderer) {
    alert('请先加载文件');
    return;
  }

  if (!cellRow.value || !cellCol.value) {
    alert('请输入行号和列号');
    return;
  }

  cellInfo.value = xlsxRenderer.getCellInfo(cellRow.value, cellCol.value);
  accessInfo.value = xlsxRenderer.getCell(cellRow.value, cellCol.value);
  logger.info('Cell info:', cellInfo.value);
}

function handleGetCellByRef() {
  if (!xlsxRenderer) {
    alert('请先加载文件');
    return;
  }

  if (!cellRef.value) {
    alert('请输入单元格引用，例如 A1');
    return;
  }

  cellInfo.value = null;
  accessInfo.value = xlsxRenderer.getCellByRef(cellRef.value);
  logger.info('Cell access:', accessInfo.value);
}

onMounted(() => {
  logger.info('Playground mounted');
  containerRef.value?.addEventListener('docx-zoom-change', handleDocxZoomChange);
});

onUnmounted(() => {
  containerRef.value?.removeEventListener('docx-zoom-change', handleDocxZoomChange);
  resetRenderState();
  delete (window as any).__oprPlayground;
});
</script>

<style scoped>
.playground {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #f5f5f5;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* 头部 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: linear-gradient(135deg, #217346 0%, #185c37 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.file-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.format-badge {
  min-width: 58px;
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.36);
  border-radius: 4px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.file-input {
  padding: 6px 12px;
  background: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-label {
  font-size: 13px;
  color: #555;
  font-weight: 500;
}

.toolbar-value {
  min-width: 42px;
  color: #344054;
  font-size: 13px;
  font-weight: 600;
  text-align: right;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e0e0e0;
  margin: 0 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
}

.checkbox-label input {
  cursor: pointer;
}

.input-number {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
}

.input-cell-ref {
  width: 72px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
  text-transform: uppercase;
}

.input-cell-ref:focus {
  outline: none;
  border-color: #217346;
}

.input-number:focus {
  outline: none;
  border-color: #217346;
}

/* 按钮 */
.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: white;
  color: #217346;
  font-weight: 500;
}

.btn-primary:hover {
  background: #f0f0f0;
}

.btn-secondary {
  background: #217346;
  color: white;
}

.btn-secondary:hover {
  background: #185c37;
}

.btn-icon {
  background: #f0f0f0;
  color: #333;
  min-width: 50px;
}

.btn-icon:hover {
  background: #e0e0e0;
}

/* 单元格信息面板 */
.cell-info-panel {
  padding: 8px 20px;
  background: #e8f5e9;
  border-bottom: 1px solid #c8e6c9;
  font-size: 13px;
  color: #2e7d32;
}

.status-panel {
  padding: 8px 20px;
  background: #f6f8fb;
  border-bottom: 1px solid #d8dce3;
  color: #344054;
  font-size: 13px;
}

.cell-info-grid {
  display: grid;
  grid-template-columns: repeat(4, max-content minmax(48px, auto));
  align-items: center;
  gap: 6px 10px;
}

.cell-info-grid span {
  color: #476b4a;
}

/* 渲染区域 */
.render-area {
  flex: 1;
  padding: 20px;
  overflow: hidden;
}

.render-container {
  width: 100%;
  height: 100%;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.render-container[data-format='docx'] {
  padding: 0;
  overflow: auto;
  background: #eef1f5;
}

.render-container[data-format='pptx'] {
  padding: 24px;
  overflow: auto;
  background: #eef1f5;
}
</style>
