/**
 * 文本运行解析器
 *
 * 解析 w:r 元素
 * 处理文本内容和格式属性
 */

import { XmlUtils } from '@ai-space/shared';
import { Logger } from '../utils/Logger';
import type {
  Run,
  RunProperties,
  UnderlineStyle,
  FontConfig,
  LanguageConfig,
  Shading,
  Tab,
  LineBreak,
  ParagraphChild
} from '../types';
import { FillParser } from '@ai-space/shared/src/drawing/parsers/FillParser';
import { ShapePropertiesParser } from '@ai-space/shared/src/drawing/parsers/ShapePropertiesParser';

const log = Logger.createTagged('RunParser');

/**
 * 文本运行解析器类
 */
export class RunParser {
  /**
   * 解析文本运行
   *
   * @param node - w:r 元素
   * @returns Run 对象
   */
  static parse(node: Element): Run {
    // 解析运行属性
    const rPrNode = XmlUtils.query(node, 'w\\:rPr, rPr');
    const props = rPrNode ? this.parseProperties(rPrNode) : {};

    // 解析文本内容
    const text = this.parseText(node);

    return {
      type: 'run',
      props,
      text
    };
  }

  /**
   * 解析运行中的所有子元素
   * 包括文本、制表符、换行符等
   *
   * @param node - w:r 元素
   * @returns 子元素数组
   */
  static parseChildren(node: Element): ParagraphChild[] {
    const children: ParagraphChild[] = [];
    const rPrNode = XmlUtils.query(node, 'w\\:rPr, rPr');
    const props = rPrNode ? this.parseProperties(rPrNode) : {};

    // 遍历所有子节点
    for (const child of Array.from(node.children)) {
      const tagName = child.tagName.toLowerCase();
      const localName = tagName.split(':').pop() || tagName;

      switch (localName) {
        case 't':
          // 文本节点
          const text = child.textContent || '';
          if (text) {
            children.push({ type: 'run', props, text });
          }
          break;

        case 'tab':
          // 制表符
          children.push({ type: 'tab' } as Tab);
          break;

        case 'br':
          // 换行符
          const breakType = child.getAttribute('w:type');
          const clear = child.getAttribute('w:clear');
          children.push({
            type: 'break',
            breakType: breakType as LineBreak['breakType'],
            clear: clear as LineBreak['clear']
          } as LineBreak);
          break;

        case 'cr':
          // 回车（等同于换行）
          children.push({ type: 'break' } as LineBreak);
          break;

        case 'sym':
          // 符号
          const font = child.getAttribute('w:font');
          const charCode = child.getAttribute('w:char');
          if (charCode) {
            const code = parseInt(charCode, 16);
            const symText = String.fromCharCode(code);
            children.push({ type: 'run', props: { ...props, fonts: { ascii: font || undefined } }, text: symText });
          }
          break;

        case 'nobreakhyphen':
          // 不换行连字符
          children.push({ type: 'run', props, text: '\u2011' });
          break;

        case 'softHyphen':
          // 软连字符
          children.push({ type: 'run', props, text: '\u00AD' });
          break;

        // 跳过: drawing, pict 等在段落级别处理
        default:
          break;
      }
    }

    return children;
  }

  /**
   * 解析文本内容
   * 包括普通文本和特殊字符
   *
   * @param node - w:r 元素
   * @returns 文本字符串
   */
  private static parseText(node: Element): string {
    const parts: string[] = [];

    // 遍历所有子节点
    for (const child of Array.from(node.children)) {
      const tagName = child.tagName.toLowerCase();
      const localName = tagName.split(':').pop() || tagName;

      switch (localName) {
        case 't':
          // 文本节点 - 注意 xml:space="preserve" 属性
          const text = child.textContent || '';
          // 检查是否保留空格
          const preserveSpace = child.getAttribute('xml:space') === 'preserve';
          if (preserveSpace) {
            parts.push(text);
          } else {
            // 默认情况下，前后空格可能被处理
            // 但为了保证一致性，我们保留所有空格
            parts.push(text);
          }
          break;

        case 'tab':
          // 制表符 - 使用制表符字符
          parts.push('\t');
          break;

        case 'br':
          // 换行符
          const breakType = child.getAttribute('w:type');
          if (breakType === 'page') {
            parts.push('\x0C'); // 分页符
          } else if (breakType === 'column') {
            parts.push('\x0B'); // 分栏符
          } else {
            parts.push('\n'); // 普通换行
          }
          break;

        case 'cr':
          // 回车
          parts.push('\n');
          break;

        case 'softHyphen':
          // 软连字符
          parts.push('\u00AD');
          break;

        case 'noBreakHyphen':
        case 'nobreakhyphen':
          // 不换行连字符
          parts.push('\u2011');
          break;

        case 'sym':
          // 符号字符
          const charCode = child.getAttribute('w:char');
          if (charCode) {
            const code = parseInt(charCode, 16);
            if (!Number.isNaN(code)) {
              parts.push(String.fromCharCode(code));
            }
          }
          break;

        default:
          // 其他未知元素忽略
          break;
      }
    }

    return parts.join('');
  }

  /**
   * 解析运行属性
   *
   * @param node - w:rPr 元素
   * @returns RunProperties 对象
   */
  static parseProperties(node: Element): RunProperties {
    const props: RunProperties = {};

    // 样式引用
    const rStyle = XmlUtils.query(node, 'w\\:rStyle, rStyle');
    if (rStyle) {
      props.styleId = rStyle.getAttribute('w:val') || undefined;
    }

    // 粗体
    const bNode = XmlUtils.query(node, 'w\\:b, b');
    if (bNode) {
      const val = bNode.getAttribute('w:val');
      props.bold = val !== '0' && val !== 'false';
    }

    // 粗体（复杂文种）
    const bCsNode = XmlUtils.query(node, 'w\\:bCs, bCs');
    if (bCsNode && !bNode) {
      const val = bCsNode.getAttribute('w:val');
      props.bold = val !== '0' && val !== 'false';
    }

    // 斜体
    const iNode = XmlUtils.query(node, 'w\\:i, i');
    if (iNode) {
      const val = iNode.getAttribute('w:val');
      props.italic = val !== '0' && val !== 'false';
    }

    // 下划线
    const uNode = XmlUtils.query(node, 'w\\:u, u');
    if (uNode) {
      const val = uNode.getAttribute('w:val');
      if (val && val !== 'none') {
        props.underline = {
          val: val as UnderlineStyle['val'],
          color: uNode.getAttribute('w:color') || undefined,
          themeColor: uNode.getAttribute('w:themeColor') || undefined
        };
      }
    }

    // 删除线
    const strikeNode = XmlUtils.query(node, 'w\\:strike, strike');
    if (strikeNode) {
      const val = strikeNode.getAttribute('w:val');
      props.strike = val !== '0' && val !== 'false';
    }

    // 双删除线
    const dstrikeNode = XmlUtils.query(node, 'w\\:dstrike, dstrike');
    if (dstrikeNode) {
      const val = dstrikeNode.getAttribute('w:val');
      props.dstrike = val !== '0' && val !== 'false';
    }

    // 垂直对齐（上标/下标）
    const vertAlignNode = XmlUtils.query(node, 'w\\:vertAlign, vertAlign');
    if (vertAlignNode) {
      const val = vertAlignNode.getAttribute('w:val');
      if (val === 'superscript' || val === 'subscript' || val === 'baseline') {
        props.vertAlign = val;
      }
    }

    // 字号
    const szNode = XmlUtils.query(node, 'w\\:sz, sz');
    if (szNode) {
      const val = szNode.getAttribute('w:val');
      if (val) {
        props.size = parseInt(val, 10);
      }
    }

    // 字号（复杂文种）
    const szCsNode = XmlUtils.query(node, 'w\\:szCs, szCs');
    if (szCsNode && !szNode) {
      const val = szCsNode.getAttribute('w:val');
      if (val) {
        props.size = parseInt(val, 10);
      }
    }

    // 字体
    const rFonts = XmlUtils.query(node, 'w\\:rFonts, rFonts');
    if (rFonts) {
      props.fonts = this.parseFonts(rFonts);
    }

    // 颜色
    const colorNode = XmlUtils.query(node, 'w\\:color, color');
    if (colorNode) {
      const val = colorNode.getAttribute('w:val');
      if (val && val !== 'auto') {
        props.color = val;
      }
    }

    // 高亮
    const highlightNode = XmlUtils.query(node, 'w\\:highlight, highlight');
    if (highlightNode) {
      props.highlight = highlightNode.getAttribute('w:val') || undefined;
    }

    // 底纹
    const shdNode = XmlUtils.query(node, 'w\\:shd, shd');
    if (shdNode) {
      props.shading = this.parseShading(shdNode);
    }

    // 字符间距
    const spacingNode = XmlUtils.query(node, 'w\\:spacing, spacing');
    if (spacingNode) {
      const val = spacingNode.getAttribute('w:val');
      if (val) {
        props.spacing = parseInt(val, 10);
      }
    }

    // 字距调整
    const kernNode = XmlUtils.query(node, 'w\\:kern, kern');
    if (kernNode) {
      const val = kernNode.getAttribute('w:val');
      if (val) {
        props.kern = parseInt(val, 10);
      }
    }

    // 位置偏移
    const positionNode = XmlUtils.query(node, 'w\\:position, position');
    if (positionNode) {
      const val = positionNode.getAttribute('w:val');
      if (val) {
        props.position = parseInt(val, 10);
      }
    }

    // 隐藏文本
    const vanishNode = XmlUtils.query(node, 'w\\:vanish, vanish');
    if (vanishNode) {
      const val = vanishNode.getAttribute('w:val');
      props.vanish = val !== '0' && val !== 'false';
    }

    // 小型大写
    const smallCapsNode = XmlUtils.query(node, 'w\\:smallCaps, smallCaps');
    if (smallCapsNode) {
      const val = smallCapsNode.getAttribute('w:val');
      props.smallCaps = val !== '0' && val !== 'false';
    }

    // 全大写
    const capsNode = XmlUtils.query(node, 'w\\:caps, caps');
    if (capsNode) {
      const val = capsNode.getAttribute('w:val');
      props.caps = val !== '0' && val !== 'false';
    }

    // 浮雕
    const embossNode = XmlUtils.query(node, 'w\\:emboss, emboss');
    if (embossNode) {
      const val = embossNode.getAttribute('w:val');
      props.emboss = val !== '0' && val !== 'false';
    }

    // 印记
    const imprintNode = XmlUtils.query(node, 'w\\:imprint, imprint');
    if (imprintNode) {
      const val = imprintNode.getAttribute('w:val');
      props.imprint = val !== '0' && val !== 'false';
    }

    // 轮廓
    const outlineNode = XmlUtils.query(node, 'w\\:outline, outline');
    if (outlineNode) {
      const val = outlineNode.getAttribute('w:val');
      props.outline = val !== '0' && val !== 'false';
    }

    // 阴影
    const shadowNode = XmlUtils.query(node, 'w\\:shadow, shadow');
    if (shadowNode) {
      const val = shadowNode.getAttribute('w:val');
      props.shadow = val !== '0' && val !== 'false';
    }

    // 语言
    const langNode = XmlUtils.query(node, 'w\\:lang, lang');
    if (langNode) {
      props.lang = this.parseLanguage(langNode);
    }

    // 缩放
    const wNode = XmlUtils.query(node, 'w\\:w, w');
    if (wNode) {
      const val = wNode.getAttribute('w:val');
      if (val) {
        props.w = parseInt(val, 10);
      }
    }

    // 文字效果
    const effectNode = XmlUtils.query(node, 'w\\:effect, effect');
    if (effectNode) {
      props.effect = effectNode.getAttribute('w:val') || undefined;
    }

    // w14:textOutline (文本轮廓)
    const textOutlineNode = XmlUtils.query(node, 'w14\\:textOutline, textOutline');
    if (textOutlineNode) {
      // 解析轮廓属性
      const w = parseInt(textOutlineNode.getAttribute('w') || '0', 10);
      const cap = textOutlineNode.getAttribute('cap');
      const cmpd = textOutlineNode.getAttribute('cmpd');
      const algn = textOutlineNode.getAttribute('algn'); // stroke alignment?

      // 解析填充 (轮廓颜色)
      const lnFill = FillParser.parseFill(textOutlineNode);
      let color;
      if (lnFill && lnFill.type === 'solid') color = lnFill.color;

      props.textOutline = {
        width: w,
        color,
        gradient: lnFill && lnFill.type === 'gradient' ? lnFill.gradient : undefined,
        cap: cap as any,
        compound: cmpd as any
        // algn ignored for now
      };

      // Dash style
      const prstDash = XmlUtils.query(textOutlineNode, 'a\\:prstDash');
      if (prstDash) {
        props.textOutline.dashStyle = prstDash.getAttribute('val') || undefined;
      }
    }

    // w14:textFill (文本填充)
    const textFillNode = XmlUtils.query(node, 'w14\\:textFill, textFill');
    if (textFillNode) {
      props.textFill = FillParser.parseFill(textFillNode);
    }

    return props;
  }

  /**
   * 解析字体配置
   *
   * @param node - w:rFonts 元素
   * @returns FontConfig 对象
   */
  private static parseFonts(node: Element): FontConfig {
    return {
      ascii: node.getAttribute('w:ascii') || undefined,
      eastAsia: node.getAttribute('w:eastAsia') || undefined,
      hAnsi: node.getAttribute('w:hAnsi') || undefined,
      cs: node.getAttribute('w:cs') || undefined,
      hint: (node.getAttribute('w:hint') as FontConfig['hint']) || undefined,
      asciiTheme: node.getAttribute('w:asciiTheme') || undefined,
      eastAsiaTheme: node.getAttribute('w:eastAsiaTheme') || undefined,
      hAnsiTheme: node.getAttribute('w:hAnsiTheme') || undefined,
      csTheme: node.getAttribute('w:cstheme') || undefined
    };
  }

  /**
   * 解析底纹
   *
   * @param node - w:shd 元素
   * @returns Shading 对象
   */
  private static parseShading(node: Element): Shading {
    return {
      val: node.getAttribute('w:val') || 'clear',
      fill: node.getAttribute('w:fill') || undefined,
      color: node.getAttribute('w:color') || undefined,
      themeFill: node.getAttribute('w:themeFill') || undefined,
      themeColor: node.getAttribute('w:themeColor') || undefined
    };
  }

  /**
   * 解析语言配置
   *
   * @param node - w:lang 元素
   * @returns LanguageConfig 对象
   */
  private static parseLanguage(node: Element): LanguageConfig {
    return {
      val: node.getAttribute('w:val') || undefined,
      eastAsia: node.getAttribute('w:eastAsia') || undefined,
      bidi: node.getAttribute('w:bidi') || undefined
    };
  }

  /**
   * 合并运行属性
   * 子属性覆盖父属性
   *
   * @param parent - 父属性
   * @param child - 子属性
   * @returns 合并后的属性
   */
  static mergeProperties(parent: RunProperties, child: RunProperties): RunProperties {
    const merged: RunProperties = { ...parent };

    // 遍历子属性，覆盖父属性
    for (const key of Object.keys(child) as (keyof RunProperties)[]) {
      if (child[key] !== undefined) {
        (merged as Record<string, unknown>)[key] = child[key];
      }
    }

    // 特殊处理字体合并
    if (parent.fonts || child.fonts) {
      merged.fonts = {
        ...parent.fonts,
        ...child.fonts
      };
    }

    return merged;
  }
}
