/**
 * XLSX 样式注入器
 *
 * 负责注入 XLSX 渲染所需的全局 CSS 样式
 */

import { FontManager } from '@ai-space/shared';

/**
 * XLSX 样式注入器类
 */
export class XlsxStyleInjector {
  private static readonly STYLE_ID = 'xlsx-renderer-styles';
  private static injected = false;

  /**
   * 注入 XLSX 专用样式表
   *
   * 使用命名空间隔离，避免与 DOCX 样式冲突
   * 确保样式只注入一次
   */
  static injectStyles(): void {
    // 注入字体 CSS 样式
    FontManager.injectFontStyles();

    // 检查是否已注入
    if (this.injected || document.getElementById(this.STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = this.STYLE_ID;
    style.textContent = `
      /* XLSX 渲染器专用样式 - 使用 xlsx-container 命名空间隔离 */
      .xlsx-container {
        font-family: 'Calibri', 'Segoe UI', 'Arial', sans-serif;
        font-size: 11pt;
        line-height: 1.2;
        color: #000;
        position: relative;
      }

      .xlsx-container * {
        box-sizing: border-box;
      }

      .xlsx-content {
        position: relative;
        flex: 1;
        overflow: auto;
      }

      .xlsx-container table {
        border-collapse: collapse;
        table-layout: fixed;
      }

      .xlsx-container td {
        padding: 2px 4px;
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Sheet 标签栏样式 - 确保不被其他样式覆盖 */
      .xlsx-container > div:last-child {
        flex-shrink: 0;
        min-height: 32px;
      }

      /* 确保 SVG 覆盖层正确显示 */
      .xlsx-container svg {
        pointer-events: none;
        overflow: visible;
      }

      .xlsx-container svg g {
        pointer-events: all;
      }
    `;

    document.head.appendChild(style);
    this.injected = true;
  }

  /**
   * 移除注入的样式
   */
  static removeStyles(): void {
    const style = document.getElementById(this.STYLE_ID);
    if (style) {
      style.remove();
      this.injected = false;
    }
  }

  /**
   * 检查样式是否已注入
   *
   * @returns 是否已注入
   */
  static isInjected(): boolean {
    return this.injected || !!document.getElementById(this.STYLE_ID);
  }

  /**
   * 获取 CSS 样式内容
   *
   * @returns CSS 样式字符串
   */
  static getStyleContent(): string {
    return `
      .xlsx-container { font-family: 'Calibri', 'Segoe UI', 'Arial', sans-serif; font-size: 11pt; line-height: 1.2; color: #000; position: relative; }
      .xlsx-container * { box-sizing: border-box; }
      .xlsx-content { position: relative; flex: 1; overflow: auto; }
      .xlsx-container table { border-collapse: collapse; table-layout: fixed; }
      .xlsx-container td { padding: 2px 4px; vertical-align: middle; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .xlsx-container > div:last-child { flex-shrink: 0; min-height: 32px; }
      .xlsx-container svg { pointer-events: none; overflow: visible; }
      .xlsx-container svg g { pointer-events: all; }
    `;
  }

  /**
   * 加载外部 CSS 文件
   *
   * @param cssUrl - CSS 文件 URL
   * @returns Promise
   */
  static async loadExternalStyles(cssUrl: string): Promise<void> {
    const existingLink = document.querySelector(`link[href="${cssUrl}"]`);
    if (existingLink) return;

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssUrl;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load CSS: ${cssUrl}`));
      document.head.appendChild(link);
    });
  }
}
