/**
 * 样式注入器
 *
 * 负责注入 DOCX 渲染所需的全局 CSS 样式
 */

/**
 * 样式注入器类
 */
export class StyleInjector {
  private static readonly STYLE_ID = 'docx-renderer-styles';
  private static injected = false;

  /**
   * 注入样式表
   *
   * 确保样式只注入一次
   */
  static injectStyles(): void {
    // 检查是否已注入
    if (this.injected || document.getElementById(this.STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = this.STYLE_ID;
    style.textContent = `
      .docx-container {
        font-family: '宋体', 'SimSun', 'Microsoft YaHei', sans-serif;
        font-size: 12pt;
        line-height: 1.2;
        color: #000;
        background-color: #808080;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
      }

      .docx-page {
        page-break-after: always;
        flex-shrink: 0;
      }

      .docx-page:last-child {
        page-break-after: auto;
      }

      .docx-paragraph {
        margin: 0;
        padding: 0;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      .docx-run {
        white-space: pre-wrap;
      }

      .docx-table {
        border-collapse: collapse;
        margin: 10px 0;
      }

      .docx-table-cell {
        vertical-align: top;
      }

      .docx-hyperlink {
        color: #0563C1;
        text-decoration: underline;
        cursor: pointer;
      }

      .docx-hyperlink:hover {
        color: #0563C1;
        text-decoration: underline;
      }

      .docx-image {
        display: inline-block;
        vertical-align: middle;
      }

      .docx-image-content {
        max-width: 100%;
        height: auto;
      }

      .docx-drawing {
        display: inline-block;
        vertical-align: middle;
      }

      .docx-list-marker {
        display: inline-block;
        min-width: 20px;
        margin-right: 8px;
      }

      .docx-field {
        /* 域代码样式 */
      }

      .docx-header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        box-sizing: border-box;
        z-index: 1;
      }

      .docx-footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        box-sizing: border-box;
        z-index: 1;
      }

      .docx-content {
        position: relative;
        z-index: 1;
      }

      .docx-watermark {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
      }

      .docx-measure-container {
        position: absolute;
        visibility: hidden;
        pointer-events: none;
      }

      /* 纸张角标样式 */
      .docx-corner-mark {
        position: absolute;
        width: 30px;
        height: 30px;
        pointer-events: none;
        z-index: 2;
      }
      .docx-corner-mark.top-left {
        border-top: 1px solid #999;
        border-left: 1px solid #999;
      }
      .docx-corner-mark.top-right {
        border-top: 1px solid #999;
        border-right: 1px solid #999;
      }
      .docx-corner-mark.bottom-left {
        border-bottom: 1px solid #999;
        border-left: 1px solid #999;
      }
      .docx-corner-mark.bottom-right {
        border-bottom: 1px solid #999;
        border-right: 1px solid #999;
      }

      @media print {
        .docx-container {
          background-color: white;
          padding: 0;
          gap: 0;
        }

        .docx-page {
          box-shadow: none;
          margin: 0;
        }
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
}
