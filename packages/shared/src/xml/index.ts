/**
 * XML 解析工具类
 *
 * 提供 OOXML 文档解析所需的 XML 操作方法
 */
export class XmlUtils {
  /**
   * 将 XML 字符串解析为 DOM 文档
   * @param xmlString - XML 字符串
   * @returns 解析后的 DOM 文档对象
   */
  static parse(xmlString: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(xmlString, 'application/xml');
  }

  /**
   * 查询单个元素，支持命名空间宽松匹配
   *
   * 在 OOXML 中严格匹配命名空间更安全，但为简化处理，
   * 当带命名空间前缀的选择器匹配失败时，会尝试仅使用本地名称匹配
   *
   * @param node - 父节点
   * @param selector - CSS 选择器（可包含命名空间前缀，如 "xdr\\:twoCellAnchor"）
   * @returns 匹配的元素，未找到则返回 null
   */
  static query(node: ParentNode, selector: string): Element | null {
    // 首先尝试严格选择器匹配
    let res = node.querySelector(selector);
    if (res) return res;

    // 回退：如果使用了命名空间前缀，尝试仅使用本地名称匹配
    // 例如："xdr\\:twoCellAnchor" -> "twoCellAnchor"
    if (selector.indexOf('\\:') !== -1) {
      const localName = selector.split('\\:').pop();
      if (localName) {
        return node.querySelector(localName);
      }
    }
    return null;
  }

  /**
   * 查询所有匹配的元素，支持命名空间宽松匹配
   *
   * @param node - 父节点
   * @param selector - CSS 选择器（可包含命名空间前缀）
   * @returns 匹配的元素数组
   */
  static queryAll(node: ParentNode, selector: string): Element[] {
    let res = Array.from(node.querySelectorAll(selector));
    if (res.length > 0) return res;

    // 回退：尝试仅使用本地名称匹配
    if (selector.indexOf('\\:') !== -1) {
      const localName = selector.split('\\:').pop();
      if (localName) {
        return Array.from(node.querySelectorAll(localName));
      }
    }
    return [];
  }

  /**
   * 获取单个子元素（getChild 别名）
   *
   * @param node - 父节点
   * @param selector - CSS 选择器
   * @returns 匹配的元素，未找到则返回 null
   */
  static getChild(node: ParentNode, selector: string): Element | null {
    return this.query(node, selector);
  }

  /**
   * 获取所有匹配的子元素（getChildren 别名）
   *
   * @param node - 父节点
   * @param selector - CSS 选择器
   * @returns 匹配的元素数组
   */
  static getChildren(node: ParentNode, selector: string): Element[] {
    return this.queryAll(node, selector);
  }

  /**
   * 获取元素属性值
   *
   * @param element - 目标元素
   * @param attrName - 属性名（可包含命名空间前缀）
   * @returns 属性值，未找到则返回 null
   */
  static getAttribute(element: Element, attrName: string): string | null {
    // 首先尝试严格匹配
    let val = element.getAttribute(attrName);
    if (val !== null) return val;

    // 回退：如果使用了命名空间前缀，尝试仅使用本地名称
    if (attrName.indexOf(':') !== -1) {
      const localName = attrName.split(':').pop();
      if (localName) {
        return element.getAttribute(localName);
      }
    }
    return null;
  }
}
