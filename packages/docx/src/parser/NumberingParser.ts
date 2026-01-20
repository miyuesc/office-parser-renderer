/**
 * 编号解析器
 *
 * 解析 word/numbering.xml
 * 处理列表和编号定义
 */

import { XmlUtils } from '@ai-space/shared';
import { Logger } from '../utils/Logger';
import { UnitConverter } from '../utils/UnitConverter';
import type {
  NumberingDefinition,
  AbstractNumbering,
  NumberingLevel,
  NumberingInstance,
  NumberingLevelOverride,
  ParagraphProperties,
  RunProperties
} from '../types';

const log = Logger.createTagged('NumberingParser');

/**
 * 编号解析器类
 */
export class NumberingParser {
  /**
   * 解析编号 XML
   *
   * @param xml - numbering.xml 内容
   * @returns 编号定义对象
   */
  static parse(xml: string): NumberingDefinition {
    const result: NumberingDefinition = {
      abstractNums: {},
      nums: {}
    };

    try {
      const doc = XmlUtils.parse(xml);

      // 1. 解析抽象编号定义
      const abstractNumNodes = XmlUtils.queryAll(doc, 'w\\:abstractNum, abstractNum');
      abstractNumNodes.forEach((node: Element) => {
        const abstractNum = this.parseAbstractNum(node);
        if (abstractNum) {
          result.abstractNums[abstractNum.id] = abstractNum;
        }
      });

      // 2. 解析编号实例
      const numNodes = XmlUtils.queryAll(doc, 'w\\:num, num');
      numNodes.forEach((node: Element) => {
        const num = this.parseNum(node);
        if (num) {
          result.nums[num.id] = num;
        }
      });

      log.info(
        `解析完成: ${Object.keys(result.abstractNums).length} 个抽象编号, ` +
          `${Object.keys(result.nums).length} 个编号实例`
      );
    } catch (e) {
      log.error('解析编号文件失败', e);
    }

    return result;
  }

  /**
   * 解析抽象编号定义
   *
   * @param node - abstractNum 元素
   * @returns 抽象编号对象
   */
  private static parseAbstractNum(node: Element): AbstractNumbering | null {
    const id = node.getAttribute('w:abstractNumId');
    if (!id) return null;

    const abstractNum: AbstractNumbering = {
      id,
      levels: {}
    };

    // 解析名称
    const nameNode = XmlUtils.query(node, 'w\\:name, name');
    if (nameNode) {
      abstractNum.name = nameNode.getAttribute('w:val') || undefined;
    }

    // 解析各级别定义
    const levelNodes = XmlUtils.queryAll(node, 'w\\:lvl, lvl');
    levelNodes.forEach((lvlNode: Element) => {
      const level = this.parseLevel(lvlNode);
      if (level) {
        const ilvl = lvlNode.getAttribute('w:ilvl') || '0';
        abstractNum.levels[ilvl] = level;
      }
    });

    return abstractNum;
  }

  /**
   * 解析编号级别
   *
   * @param node - lvl 元素
   * @returns 编号级别对象
   */
  private static parseLevel(node: Element): NumberingLevel | null {
    const level: NumberingLevel = {
      start: 1,
      format: 'decimal',
      text: '',
      alignment: 'left',
      indent: 0
    };

    // 起始值
    const startNode = XmlUtils.query(node, 'w\\:start, start');
    if (startNode) {
      level.start = parseInt(startNode.getAttribute('w:val') || '1', 10);
    }

    // 编号格式
    const numFmtNode = XmlUtils.query(node, 'w\\:numFmt, numFmt');
    if (numFmtNode) {
      level.format = numFmtNode.getAttribute('w:val') || 'decimal';
    }

    // 编号文本
    const lvlTextNode = XmlUtils.query(node, 'w\\:lvlText, lvlText');
    if (lvlTextNode) {
      level.text = lvlTextNode.getAttribute('w:val') || '';
    }

    // 对齐方式
    const lvlJcNode = XmlUtils.query(node, 'w\\:lvlJc, lvlJc');
    if (lvlJcNode) {
      const jc = lvlJcNode.getAttribute('w:val');
      if (jc === 'left' || jc === 'center' || jc === 'right') {
        level.alignment = jc;
      }
    }

    // 后缀类型
    const suff = XmlUtils.query(node, 'w\\:suff, suff');
    if (suff) {
      const suffVal = suff.getAttribute('w:val');
      if (suffVal === 'tab' || suffVal === 'space' || suffVal === 'nothing') {
        level.suffix = suffVal;
      }
    }

    // 法律格式
    const isLglNode = XmlUtils.query(node, 'w\\:isLgl, isLgl');
    if (isLglNode) {
      level.isLgl = true;
    }

    // 段落属性
    const pPrNode = XmlUtils.query(node, 'w\\:pPr, pPr');
    if (pPrNode) {
      level.pPr = this.parseLevelParagraphProperties(pPrNode);
      // 提取缩进值
      if (level.pPr?.indentation?.left) {
        level.indent = level.pPr.indentation.left;
      }
      if (level.pPr?.indentation?.hanging) {
        level.hanging = level.pPr.indentation.hanging;
      }
    }

    // 运行属性
    const rPrNode = XmlUtils.query(node, 'w\\:rPr, rPr');
    if (rPrNode) {
      level.rPr = this.parseLevelRunProperties(rPrNode);
    }

    return level;
  }

  /**
   * 解析级别段落属性（简化版）
   *
   * @param node - pPr 元素
   * @returns 段落属性
   */
  private static parseLevelParagraphProperties(node: Element): ParagraphProperties {
    const props: ParagraphProperties = {};

    // 缩进
    const indNode = XmlUtils.query(node, 'w\\:ind, ind');
    if (indNode) {
      props.indentation = {};

      const left = indNode.getAttribute('w:left');
      if (left) {
        props.indentation.left = parseInt(left, 10);
      }

      const hanging = indNode.getAttribute('w:hanging');
      if (hanging) {
        props.indentation.hanging = parseInt(hanging, 10);
      }

      const firstLine = indNode.getAttribute('w:firstLine');
      if (firstLine) {
        props.indentation.firstLine = parseInt(firstLine, 10);
      }
    }

    // 制表位
    const tabsNode = XmlUtils.query(node, 'w\\:tabs, tabs');
    if (tabsNode) {
      props.tabs = [];
      const tabNodes = XmlUtils.queryAll(tabsNode, 'w\\:tab, tab');
      tabNodes.forEach((tab: Element) => {
        const pos = tab.getAttribute('w:pos');
        const val = tab.getAttribute('w:val');
        if (pos && val) {
          props.tabs!.push({
            pos: parseInt(pos, 10),
            val: val as 'left' | 'center' | 'right' | 'decimal' | 'bar' | 'clear'
          });
        }
      });
    }

    return props;
  }

  /**
   * 解析级别运行属性（简化版）
   *
   * @param node - rPr 元素
   * @returns 运行属性
   */
  private static parseLevelRunProperties(node: Element): RunProperties {
    const props: RunProperties = {};

    // 字体
    const rFonts = XmlUtils.query(node, 'w\\:rFonts, rFonts');
    if (rFonts) {
      props.fonts = {
        ascii: rFonts.getAttribute('w:ascii') || undefined,
        eastAsia: rFonts.getAttribute('w:eastAsia') || undefined,
        hAnsi: rFonts.getAttribute('w:hAnsi') || undefined,
        cs: rFonts.getAttribute('w:cs') || undefined
      };
    }

    // 粗体
    const bNode = XmlUtils.query(node, 'w\\:b, b');
    if (bNode) {
      const val = bNode.getAttribute('w:val');
      props.bold = val !== '0' && val !== 'false';
    }

    // 斜体
    const iNode = XmlUtils.query(node, 'w\\:i, i');
    if (iNode) {
      const val = iNode.getAttribute('w:val');
      props.italic = val !== '0' && val !== 'false';
    }

    // 颜色
    const colorNode = XmlUtils.query(node, 'w\\:color, color');
    if (colorNode) {
      const val = colorNode.getAttribute('w:val');
      if (val && val !== 'auto') {
        props.color = val;
      }
    }

    // 字号
    const szNode = XmlUtils.query(node, 'w\\:sz, sz');
    if (szNode) {
      props.size = parseInt(szNode.getAttribute('w:val') || '24', 10);
    }

    return props;
  }

  /**
   * 解析编号实例
   *
   * @param node - num 元素
   * @returns 编号实例对象
   */
  private static parseNum(node: Element): NumberingInstance | null {
    const id = node.getAttribute('w:numId');
    if (!id) return null;

    const abstractNumIdNode = XmlUtils.query(node, 'w\\:abstractNumId, abstractNumId');
    const abstractNumId = abstractNumIdNode?.getAttribute('w:val');
    if (!abstractNumId) return null;

    const num: NumberingInstance = {
      id,
      abstractNumId
    };

    // 解析级别覆盖
    const lvlOverrideNodes = XmlUtils.queryAll(node, 'w\\:lvlOverride, lvlOverride');
    if (lvlOverrideNodes.length > 0) {
      num.levelOverrides = {};
      lvlOverrideNodes.forEach((overrideNode: Element) => {
        const ilvl = overrideNode.getAttribute('w:ilvl');
        if (ilvl) {
          const override = this.parseLevelOverride(overrideNode);
          if (override) {
            num.levelOverrides![ilvl] = override;
          }
        }
      });
    }

    return num;
  }

  /**
   * 解析级别覆盖
   *
   * @param node - lvlOverride 元素
   * @returns 级别覆盖对象
   */
  private static parseLevelOverride(node: Element): NumberingLevelOverride | null {
    const override: NumberingLevelOverride = {};

    // 起始值覆盖
    const startOverrideNode = XmlUtils.query(node, 'w\\:startOverride, startOverride');
    if (startOverrideNode) {
      override.startOverride = parseInt(startOverrideNode.getAttribute('w:val') || '1', 10);
    }

    // 级别定义覆盖
    const lvlNode = XmlUtils.query(node, 'w\\:lvl, lvl');
    if (lvlNode) {
      override.level = this.parseLevel(lvlNode) || undefined;
    }

    return Object.keys(override).length > 0 ? override : null;
  }

  /**
   * 获取编号级别定义
   * 考虑级别覆盖
   *
   * @param numbering - 编号定义集合
   * @param numId - 编号实例 ID
   * @param ilvl - 级别索引
   * @returns 编号级别定义
   */
  static getLevel(numbering: NumberingDefinition, numId: string, ilvl: string): NumberingLevel | null {
    const num = numbering.nums[numId];
    if (!num) return null;

    // 检查是否有级别覆盖
    const override = num.levelOverrides?.[ilvl];
    if (override?.level) {
      return override.level;
    }

    // 从抽象编号获取
    const abstractNum = numbering.abstractNums[num.abstractNumId];
    if (!abstractNum) return null;

    return abstractNum.levels[ilvl] || null;
  }

  /**
   * 格式化编号文本
   *
   * @param level - 编号级别
   * @param value - 当前计数值
   * @returns 格式化后的文本
   */
  static formatNumber(level: NumberingLevel, value: number): string {
    let formatted: string;

    switch (level.format) {
      case 'decimal':
        formatted = String(value);
        break;
      case 'decimalZero':
        formatted = value < 10 ? `0${value}` : String(value);
        break;
      case 'upperRoman':
        formatted = this.toRoman(value).toUpperCase();
        break;
      case 'lowerRoman':
        formatted = this.toRoman(value).toLowerCase();
        break;
      case 'upperLetter':
        formatted = this.toLetter(value).toUpperCase();
        break;
      case 'lowerLetter':
        formatted = this.toLetter(value).toLowerCase();
        break;
      case 'bullet':
        formatted = '•';
        break;
      case 'ordinal':
        formatted = this.toOrdinal(value);
        break;
      case 'cardinalText':
        formatted = this.toCardinalText(value);
        break;
      case 'ordinalText':
        formatted = this.toOrdinalText(value);
        break;
      case 'chineseCounting':
      case 'chineseCountingThousand':
        formatted = this.toChinese(value);
        break;
      case 'ideographDigital':
        formatted = this.toIdeographDigital(value);
        break;
      case 'none':
        formatted = '';
        break;
      default:
        formatted = String(value);
    }

    // 替换级别文本中的占位符
    let result = level.text;
    result = result.replace(/%\d+/g, formatted);

    return result;
  }

  /**
   * 数字转罗马数字
   */
  private static toRoman(num: number): string {
    const romanNumerals: [number, string][] = [
      [1000, 'M'],
      [900, 'CM'],
      [500, 'D'],
      [400, 'CD'],
      [100, 'C'],
      [90, 'XC'],
      [50, 'L'],
      [40, 'XL'],
      [10, 'X'],
      [9, 'IX'],
      [5, 'V'],
      [4, 'IV'],
      [1, 'I']
    ];

    let result = '';
    let n = num;
    for (const [value, symbol] of romanNumerals) {
      while (n >= value) {
        result += symbol;
        n -= value;
      }
    }
    return result;
  }

  /**
   * 数字转字母
   */
  private static toLetter(num: number): string {
    let result = '';
    let n = num;
    while (n > 0) {
      n--;
      result = String.fromCharCode(65 + (n % 26)) + result;
      n = Math.floor(n / 26);
    }
    return result;
  }

  /**
   * 数字转序数词
   */
  private static toOrdinal(num: number): string {
    const suffix = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
  }

  /**
   * 数字转基数文本
   */
  private static toCardinalText(num: number): string {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = [
      'ten',
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen'
    ];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? '-' + ones[num % 10] : '');
    return String(num); // 简化处理
  }

  /**
   * 数字转序数文本
   */
  private static toOrdinalText(num: number): string {
    const ordinals = [
      '',
      'first',
      'second',
      'third',
      'fourth',
      'fifth',
      'sixth',
      'seventh',
      'eighth',
      'ninth',
      'tenth'
    ];
    if (num <= 10) return ordinals[num];
    return this.toCardinalText(num) + 'th';
  }

  /**
   * 数字转中文
   */
  private static toChinese(num: number): string {
    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const units = ['', '十', '百', '千'];

    if (num < 10) return digits[num];
    if (num < 100) {
      const ten = Math.floor(num / 10);
      const one = num % 10;
      return (ten === 1 ? '' : digits[ten]) + '十' + (one ? digits[one] : '');
    }
    return String(num); // 简化处理
  }

  /**
   * 数字转全角数字
   */
  private static toIdeographDigital(num: number): string {
    const fullWidth = '０１２３４５６７８９';
    return String(num)
      .split('')
      .map(d => fullWidth[parseInt(d, 10)])
      .join('');
  }
}
