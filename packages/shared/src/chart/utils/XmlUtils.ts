/**
 * XML 解析辅助工具类
 * 用于处理 Office Open XML 中复杂的命名空间和嵌套结构
 */
export class XmlUtils {
  /**
   * 根据标签名查找第一个子元素（忽略命名空间前缀）
   * @param parent 父节点
   * @param tagName 标签名 (不带前缀，如 "barChart")
   */
  static getChild(parent: Element | Document, tagName: string): Element | null {
    if (!parent) return null;

    // 优先尝试标准 querySelector (带命名空间或不带)
    // 但由于浏览器 DOMParser 对命名空间处理有时不稳定，
    // 这里使用遍历方式匹配 localName，更稳健
    for (let i = 0; i < parent.children.length; i++) {
      const child = parent.children[i];
      // localName 是不带前缀的标签名
      if (child.localName === tagName) {
        return child;
      }
    }
    return null;
  }

  /**
   * 查找所有匹配标签名的子元素（忽略命名空间前缀）
   */
  static getChildren(parent: Element | Document, tagName: string): Element[] {
    if (!parent) return [];

    const results: Element[] = [];
    for (let i = 0; i < parent.children.length; i++) {
      const child = parent.children[i];
      if (child.localName === tagName) {
        results.push(child);
      }
    }
    return results;
  }

  /**
   * 获取元素的文本内容（通常用于 <c:v>100</c:v> 这种情况）
   */
  static getText(element: Element | null): string {
    return element?.textContent || '';
  }

  /**
   * 获取属性值
   */
  static getAttr(element: Element | null, attrName: string): string | null {
    if (!element) return null;
    return element.getAttribute(attrName);
  }

  /**
   * 获取布尔属性值 (通常 1/0 或 true/false)
   * 在 OOXML 中，很多布尔值是用 <c:auto val="0"/> 这种形式
   */
  static getBooleanVal(element: Element | null, defaultVal = false): boolean {
    if (!element) return defaultVal;
    const val = element.getAttribute('val');
    if (val === '1' || val === 'true') return true;
    if (val === '0' || val === 'false') return false;
    return defaultVal;
  }
}
