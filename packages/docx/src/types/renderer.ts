/**
 * DOCX 渲染配置相关类型定义
 */

import type { WatermarkConfig } from './section';
import type { DocxSection } from './section';

/**
 * 渲染选项接口
 */
export interface DocxRenderOptions {
  /** 纸张大小：预设值或自定义尺寸 (pt) */
  pageSize?: 'A4' | 'A5' | 'A3' | 'Letter' | 'Legal' | { width: number; height: number };
  /** 是否使用文档内置的页面设置 */
  useDocumentSettings?: boolean;
  /** 自定义页边距 (pt) */
  margins?: { top?: number; right?: number; bottom?: number; left?: number };
  /** 缩放比例 (0.5 - 2.0) */
  scale?: number;
  /** 是否显示页眉页脚 */
  showHeaderFooter?: boolean;
  /** 是否显示页码 */
  showPageNumber?: boolean;
  /** 是否启用分页 */
  enablePagination?: boolean;
  /** 调试模式（显示边界框等） */
  debug?: boolean;
  /** 页面背景色覆盖 */
  backgroundColor?: string;
  /** 水印配置覆盖 */
  watermark?: WatermarkConfig;
  /** 是否使用文档解析的背景色（默认 true，设为 false 则只使用 API 设置的值） */
  useDocumentBackground?: boolean;
  /** 是否使用文档解析的水印（默认 true，设为 false 则只使用 API 设置的值) */
  useDocumentWatermark?: boolean;
  /** 每页渲染回调 */
  onPageRender?: (pageIndex: number, pageElement: HTMLElement) => void;
}

/**
 * 渲染结果接口
 */
export interface DocxRenderResult {
  /** 总页数 */
  totalPages: number;
  /** 实际使用的页面配置 */
  pageConfig: ResolvedPageConfig;
  /** 页面元素列表 */
  pages: HTMLElement[];
}

/**
 * 解析后的页面配置
 */
export interface ResolvedPageConfig {
  /** 纸张宽度 (pt) */
  width: number;
  /** 纸张高度 (pt) */
  height: number;
  /** 页边距 (pt) */
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    header: number;
    footer: number;
  };
  /** 内容区域宽度 (pt) */
  contentWidth: number;
  /** 内容区域高度 (pt) */
  contentHeight: number;
}

/**
 * 页面信息接口
 * 用于存储每页的渲染信息
 */
export interface PageInfo {
  /** 页面索引 (0-based) */
  index: number;
  /** 页码 (1-based) */
  pageNumber: number;
  /** 分节索引 */
  sectionIndex: number;
  /** 元素起始索引 */
  startElementIndex: number;
  /** 元素结束索引 */
  endElementIndex: number;
  /** 页面配置 */
  pageConfig: ResolvedPageConfig;
  /** 所属分节 */
  section: DocxSection;
}
