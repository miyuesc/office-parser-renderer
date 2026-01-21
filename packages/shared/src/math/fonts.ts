/**
 * 数学字体工具
 *
 * 处理 Office Math 公式所需的字体加载与回退
 */

// ============================================================================
// 字体常量
// ============================================================================

/**
 * 数学字体栈（按优先级排序）
 * Cambria Math 是 Office 默认数学字体
 */
export const MATH_FONT_STACK = [
  'Cambria Math',
  'Latin Modern Math',
  'STIX Two Math',
  'XITS Math',
  'DejaVu Math TeX Gyre',
  'Asana Math',
  'serif'
] as const;

/**
 * 数学字体 CSS font-family 值
 */
export const MATH_FONT_FAMILY = MATH_FONT_STACK.map(f => (f.includes(' ') ? `"${f}"` : f)).join(', ');

// ============================================================================
// 常用数学符号映射
// ============================================================================

/**
 * N 元运算符字符映射
 * Unicode 码点到显示字符
 */
export const NARY_OPERATORS: Record<string, string> = {
  // 求和
  '∑': '∑',
  // 乘积
  '∏': '∏',
  // 余积
  '∐': '∐',
  // 积分
  '∫': '∫',
  // 二重积分
  '∬': '∬',
  // 三重积分
  '∭': '∭',
  // 环路积分
  '∮': '∮',
  // 曲面积分
  '∯': '∯',
  // 体积积分
  '∰': '∰',
  // 并集
  '⋃': '⋃',
  // 交集
  '⋂': '⋂',
  // 逻辑或
  '⋁': '⋁',
  // 逻辑与
  '⋀': '⋀'
};

/**
 * 定界符字符映射
 * 默认括号字符
 */
export const DELIMITER_CHARS: Record<string, { begin: string; end: string }> = {
  parenthesis: { begin: '(', end: ')' },
  bracket: { begin: '[', end: ']' },
  brace: { begin: '{', end: '}' },
  angle: { begin: '〈', end: '〉' },
  floor: { begin: '⌊', end: '⌋' },
  ceiling: { begin: '⌈', end: '⌉' },
  bar: { begin: '|', end: '|' },
  doubleBar: { begin: '‖', end: '‖' }
};

/**
 * 重音符号映射
 */
export const ACCENT_CHARS: Record<string, string> = {
  hat: '\u0302', // 帽子 ^
  check: '\u030C', // 倒帽子 ˇ
  tilde: '\u0303', // 波浪号 ~
  bar: '\u0305', // 上划线 ¯
  dot: '\u0307', // 点 ·
  ddot: '\u0308', // 双点 ¨
  vec: '\u20D7', // 向量箭头 →
  widehat: '\u0302',
  widetilde: '\u0303'
};

// ============================================================================
// 字体检测
// ============================================================================

/**
 * 字体可用性缓存
 */
const fontAvailabilityCache = new Map<string, boolean>();

/**
 * 检查指定字体是否可用
 *
 * @param fontName - 字体名称
 * @returns 字体是否可用
 */
export function isFontAvailable(fontName: string): boolean {
  // 检查缓存
  if (fontAvailabilityCache.has(fontName)) {
    return fontAvailabilityCache.get(fontName)!;
  }

  // 在浏览器环境中检测字体
  if (typeof document === 'undefined') {
    return false;
  }

  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';

  // 创建测试元素
  const span = document.createElement('span');
  span.style.position = 'absolute';
  span.style.left = '-9999px';
  span.style.fontSize = testSize;
  span.style.lineHeight = 'normal';
  span.textContent = testString;
  document.body.appendChild(span);

  // 测量默认字体宽度
  span.style.fontFamily = 'monospace';
  const defaultWidth = span.offsetWidth;

  // 测量目标字体宽度
  span.style.fontFamily = `"${fontName}", monospace`;
  const targetWidth = span.offsetWidth;

  // 清理
  document.body.removeChild(span);

  // 如果宽度不同，说明字体可用
  const isAvailable = defaultWidth !== targetWidth;
  fontAvailabilityCache.set(fontName, isAvailable);

  return isAvailable;
}

/**
 * 检查 Cambria Math 是否可用
 *
 * @returns Promise<boolean>
 */
export async function isCambriaMathAvailable(): Promise<boolean> {
  // 使用 document.fonts API（如果可用）
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
      return document.fonts.check('12px "Cambria Math"');
    } catch {
      // 回退到传统检测
      return isFontAvailable('Cambria Math');
    }
  }
  return isFontAvailable('Cambria Math');
}

/**
 * 获取数学字体 CSS font-family 值
 *
 * @returns CSS font-family 字符串
 */
export function getMathFontFamily(): string {
  return MATH_FONT_FAMILY;
}

/**
 * 获取第一个可用的数学字体
 *
 * @returns 可用的字体名称
 */
export function getAvailableMathFont(): string {
  for (const font of MATH_FONT_STACK) {
    if (font === 'serif' || isFontAvailable(font)) {
      return font;
    }
  }
  return 'serif';
}
