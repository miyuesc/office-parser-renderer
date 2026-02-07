<template>
  <div class="playground">
    <!-- 顶部控制栏 -->
    <header class="header">
      <h1 class="title">Office Parser Renderer</h1>
      <div class="file-controls">
        <input
          type="file"
          ref="fileInputRef"
          accept=".docx,.pptx,.xlsx"
          @change="handleFileChange"
          class="file-input"
        />
        <button class="btn btn-primary" @click="loadTestXlsx">测试 XLSX</button>
      </div>
    </header>

    <!-- 工具栏 -->
    <div class="toolbar">
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
      </div>
    </div>

    <!-- 单元格信息展示 -->
    <div v-if="cellInfo" class="cell-info-panel">
      <strong>单元格 ({{ cellInfo.row }}, {{ cellInfo.col }}):</strong>
      <p v-if="cellInfo.cell">
        <p>值: {{ cellInfo.cell.value ?? '(空)' }}</p>
        <p>位置: ({{ cellInfo.screenBounds.x.toFixed(0) }}, {{ cellInfo.screenBounds.y.toFixed(0) }})</p>
        <p>尺寸: {{ cellInfo.screenBounds.width.toFixed(0) }} * {{ cellInfo.screenBounds.height.toFixed(0) }}</p>
      </p>
      <p v-else>单元格不存在</p>
    </div>

    <!-- 渲染容器 -->
    <div class="render-area">
      <div ref="containerRef" class="render-container"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { XlsxParser, XlsxRenderer } from '@opr/xlsx';
import { Logger } from '@opr/shared';

const logger = new Logger('Playground');

// Refs
const fileInputRef = ref<HTMLInputElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);

// Renderer 实例
let renderer: XlsxRenderer | null = null;

// 冻结控制
const renderFrozenRows = ref(true);
const renderFrozenCols = ref(true);

// 行/列标号
const showRowHeaders = ref(true);
const showColHeaders = ref(true);

// 滚动定位
const scrollRow = ref<number | undefined>(undefined);
const scrollCol = ref<number | undefined>(undefined);

// 单元格查询
const cellRow = ref<number | undefined>(undefined);
const cellCol = ref<number | undefined>(undefined);
const cellInfo = ref<ReturnType<XlsxRenderer['getCellInfo']>>(null);

// 当前文档（用于重新创建渲染器）
let currentDoc: Awaited<ReturnType<typeof XlsxParser.parse>> | null = null;

/**
 * 处理文件选择
 */
async function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  logger.info('Loading file:', file.name);

  try {
    const buffer = await file.arrayBuffer();
    const doc = await XlsxParser.parse(buffer);
    logger.info('Parsed document:', doc);

    currentDoc = doc;
    renderDocument(doc);
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

    currentDoc = doc;
    renderDocument(doc);
  } catch (err) {
    logger.error('Failed to load test xlsx:', err);
    alert('测试文件加载失败。');
  }
}

/**
 * 渲染文档
 */
function renderDocument(doc: Awaited<ReturnType<typeof XlsxParser.parse>>) {
  if (!containerRef.value) return;

  if (doc.worksheets.size > 0) {
    const worksheet = doc.worksheets.values().next().value;
    if (worksheet) {
      logger.info('Rendering worksheet:', worksheet);

      // 销毁旧渲染器
      if (renderer) {
        renderer.destroy();
      }

      // 创建新渲染器
      renderer = new XlsxRenderer(containerRef.value, {
        width: containerRef.value.clientWidth,
        height: containerRef.value.clientHeight,
        renderFrozenRows: renderFrozenRows.value,
        renderFrozenCols: renderFrozenCols.value,
        showRowHeaders: showRowHeaders.value,
        showColHeaders: showColHeaders.value
      });

      renderer.setWorksheet(worksheet, doc);
    }
  } else {
    logger.warn('No worksheets found');
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
  if (!renderer) {
    alert('请先加载文件');
    return;
  }

  renderer.scrollTo({
    row: scrollRow.value,
    col: scrollCol.value
  });
}

/**
 * 缩放
 */
function handleZoom(scale: number) {
  if (!renderer) {
    alert('请先加载文件');
    return;
  }

  renderer.zoomTo(scale);
}

/**
 * 获取单元格信息
 */
function handleGetCellInfo() {
  if (!renderer) {
    alert('请先加载文件');
    return;
  }

  if (!cellRow.value || !cellCol.value) {
    alert('请输入行号和列号');
    return;
  }

  cellInfo.value = renderer.getCellInfo(cellRow.value, cellCol.value);
  logger.info('Cell info:', cellInfo.value);
}

onMounted(() => {
  logger.info('Playground mounted');
});

onUnmounted(() => {
  if (renderer) {
    renderer.destroy();
    renderer = null;
  }
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
</style>
