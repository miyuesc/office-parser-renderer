/**
 * 字体管理器
 *
 * 提供 Office 字体名到 CSS 字体族的映射、CSS 类名生成和样式注入功能
 * 用于确保 DOCX 和 XLSX 渲染时使用一致的字体处理逻辑
 */

import { fonts } from './index';

/** 字体样式 ID，用于避免重复注入 */
const FONT_STYLE_ID = 'office-font-styles';

/** CSS 类名前缀 */
const FONT_CLASS_PREFIX = 'font-';

/**
 * 字体管理器类
 *
 * 提供 Office 字体名称与 Web CSS 字体的映射和管理功能
 */
export class FontManager {
  /** 已生成的 CSS 类名缓存 */
  private static classNameCache: Map<string, string> = new Map();

  /**
   * 根据 Office 字体名获取带降级的 CSS font-family 值
   *
   * 支持多种字体名称格式：
   * - 中文名称：如 "微软雅黑"、"宋体"
   * - 英文名称：如 "Microsoft YaHei"、"SimSun"
   * - 主题字体：如 "+Body"、"+Heading"（返回默认字体）
   *
   * @param officeName - Office 字体名称
   * @returns CSS font-family 值（包含降级字体）
   */
  static getFontFamily(officeName: string): string {
    if (!officeName) {
      return this.getDefaultFontFamily();
    }

    // 处理主题字体引用
    if (officeName.startsWith('+')) {
      // +Body, +Heading 等主题字体，返回默认字体
      return this.getDefaultFontFamily();
    }

    // 尝试直接匹配中文字体名
    if (fonts[officeName]) {
      return fonts[officeName].safe_css_family;
    }

    // 尝试通过 CSS family 名称反向查找
    for (const [key, font] of Object.entries(fonts)) {
      if (
        font.css_family.toLowerCase() === officeName.toLowerCase() ||
        key.toLowerCase() === officeName.toLowerCase()
      ) {
        return font.safe_css_family;
      }
    }

    // 未找到映射，返回原字体名加默认降级
    return `"${officeName}", ${this.getDefaultFontFamily()}`;
  }

  /**
   * 获取字体对应的 CSS 类名
   *
   * 类名格式：font-xxx（小写，空格和特殊字符转为连字符）
   *
   * @param officeName - Office 字体名称
   * @returns CSS 类名（不含点号前缀）
   */
  static getFontClassName(officeName: string): string {
    if (!officeName) {
      return `${FONT_CLASS_PREFIX}default`;
    }

    // 检查缓存
    const cached = this.classNameCache.get(officeName);
    if (cached) {
      return cached;
    }

    // 生成类名：转小写，替换空格和特殊字符
    let className = officeName
      .toLowerCase()
      .replace(/[\s+]/g, '-')
      .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // 如果是中文字体名，尝试使用英文 CSS 名称
    if (fonts[officeName]) {
      className = fonts[officeName].css_family
        .toLowerCase()
        .replace(/[\s]/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    }

    className = `${FONT_CLASS_PREFIX}${className || 'default'}`;

    // 缓存结果
    this.classNameCache.set(officeName, className);
    return className;
  }

  /**
   * 向文档注入字体 CSS 样式
   *
   * 为所有已定义的字体生成对应的 CSS 类，如：
   * .font-microsoft-yahei { font-family: "Microsoft YaHei", ... }
   *
   * 该方法是幂等的，重复调用不会重复注入样式
   */
  static injectFontStyles(): void {
    // 检查是否已注入
    if (document.getElementById(FONT_STYLE_ID)) {
      return;
    }

    const styleEl = document.createElement('style');
    styleEl.id = FONT_STYLE_ID;

    const cssRules: string[] = [];

    // 添加默认字体类
    cssRules.push(`.${FONT_CLASS_PREFIX}default { font-family: ${this.getDefaultFontFamily()}; }`);

    // 为每个定义的字体生成 CSS 类
    for (const [officeName, font] of Object.entries(fonts)) {
      const className = this.getFontClassName(officeName);
      cssRules.push(`.${className} { font-family: ${font.safe_css_family}; }`);
    }

    styleEl.textContent = cssRules.join('\n');
    document.head.appendChild(styleEl);
  }

  /**
   * 获取默认字体族
   *
   * @returns 默认的 CSS font-family 值
   */
  static getDefaultFontFamily(): string {
    // 优先使用等线（Office 2016+ 默认），降级到微软雅黑和系统字体
    return '"DengXian", "等线", "Microsoft YaHei", "微软雅黑", -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  }

  /**
   * 根据字体属性获取完整的 font-family 值
   *
   * 处理 OOXML 中的多字体配置（ascii, eastAsia, hAnsi, cs）
   *
   * @param fontProps - 字体属性对象
   * @returns CSS font-family 值
   */
  static getFontFamilyFromProps(fontProps: { ascii?: string; eastAsia?: string; hAnsi?: string; cs?: string }): string {
    const parts: string[] = [];

    // 优先使用东亚字体（中文环境）
    if (fontProps.eastAsia) {
      const family = this.getFontFamily(fontProps.eastAsia);
      if (!parts.includes(family)) {
        parts.push(family);
      }
    }

    // ASCII 字体（英文/数字）
    if (fontProps.ascii) {
      const family = this.getFontFamily(fontProps.ascii);
      if (!parts.includes(family)) {
        parts.push(family);
      }
    }

    // hAnsi 字体
    if (fontProps.hAnsi && fontProps.hAnsi !== fontProps.ascii) {
      const family = this.getFontFamily(fontProps.hAnsi);
      if (!parts.includes(family)) {
        parts.push(family);
      }
    }

    // 复杂脚本字体
    if (fontProps.cs && fontProps.cs !== fontProps.ascii) {
      const family = this.getFontFamily(fontProps.cs);
      if (!parts.includes(family)) {
        parts.push(family);
      }
    }

    // 如果没有任何字体，返回默认字体
    if (parts.length === 0) {
      return this.getDefaultFontFamily();
    }

    return parts.join(', ');
  }

  /**
   * 检查字体是否已定义
   *
   * @param officeName - Office 字体名称
   * @returns 是否已有映射定义
   */
  static hasFont(officeName: string): boolean {
    if (!officeName) return false;

    // 直接匹配
    if (fonts[officeName]) return true;

    // 通过 CSS family 名称查找
    for (const font of Object.values(fonts)) {
      if (font.css_family.toLowerCase() === officeName.toLowerCase()) {
        return true;
      }
    }

    return false;
  }
}
