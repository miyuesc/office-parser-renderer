/**
 * 工作表布局管理器
 *
 * 负责创建 XLSX 的标签栏和内容容器
 */

import type { XlsxWorkbook } from '../types';

/**
 * 工作表布局管理器类
 */
export class SheetLayoutManager {
  /**
   * 创建工作表标签栏
   *
   * @param workbook - 工作簿数据
   * @param activeIndex - 当前激活的工作表索引
   * @param onTabClick - 标签点击回调函数
   * @returns 标签栏 DOM 元素
   */
  static createTabBar(workbook: XlsxWorkbook, activeIndex: number, onTabClick: (index: number) => void): HTMLElement {
    const tabBar = document.createElement('div');
    tabBar.className = 'xlsx-tabs';

    for (let i = 0; i < workbook.sheets.length; i++) {
      const sheet = workbook.sheets[i];
      const tab = document.createElement('button');
      tab.className = 'xlsx-tab';
      tab.textContent = sheet.name || `Sheet${i + 1}`;

      if (i === activeIndex) {
        tab.classList.add('active');
      }

      // 点击切换工作表
      tab.onclick = () => {
        onTabClick(i);
      };

      tabBar.appendChild(tab);
    }

    return tabBar;
  }

  /**
   * 创建内容容器
   *
   * @returns 内容容器 DOM 元素
   */
  static createContentContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'xlsx-content';
    return container;
  }

  /**
   * 更新标签栏的激活状态
   *
   * @param tabBar - 标签栏元素
   * @param activeIndex - 新的激活索引
   */
  static updateActiveTab(tabBar: HTMLElement, activeIndex: number): void {
    const tabs = tabBar.querySelectorAll('.xlsx-tab');
    tabs.forEach((tab, index) => {
      if (index === activeIndex) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }
}
