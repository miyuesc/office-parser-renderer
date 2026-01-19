/**
 * OOXML 主题颜色枚举
 *
 * 定义 Office 主题中使用的颜色类型和默认值
 */

/**
 * 主题颜色类型
 */
export type ThemeColorType =
  | 'dk1' // 深色 1（通常为黑色）
  | 'lt1' // 浅色 1（通常为白色）
  | 'dk2' // 深色 2
  | 'lt2' // 浅色 2
  | 'accent1' // 强调色 1
  | 'accent2' // 强调色 2
  | 'accent3' // 强调色 3
  | 'accent4' // 强调色 4
  | 'accent5' // 强调色 5
  | 'accent6' // 强调色 6
  | 'hlink' // 超链接颜色
  | 'folHlink'; // 已访问超链接颜色

/**
 * Office 2013+ 默认主题颜色（回退值）
 */
export const DefaultThemeColors: Record<ThemeColorType, string> = {
  dk1: '000000', // 系统文本色
  lt1: 'FFFFFF', // 系统背景色
  dk2: '44546A', // 深色 2
  lt2: 'E7E6E6', // 浅色 2
  accent1: '4472C4', // 蓝色
  accent2: 'ED7D31', // 橙色
  accent3: 'A5A5A5', // 灰色
  accent4: 'FFC000', // 金色
  accent5: '5B9BD5', // 浅蓝色
  accent6: '70AD47', // 绿色
  hlink: '0563C1', // 超链接
  folHlink: '954F72' // 已访问超链接
};

/**
 * 将 XML 属性值映射为主题颜色类型
 *
 * 处理 Office 中使用的颜色别名，如：
 * - tx1/text1 -> dk1
 * - tx2/text2 -> dk2
 * - bg1/background1 -> lt1
 * - bg2/background2 -> lt2
 *
 * @param val - XML 中的颜色属性值（如 "accent1", "tx1"）
 * @returns 标准化的主题颜色类型
 */
export function mapThemeColor(val: string): ThemeColorType | undefined {
  // 处理别名
  switch (val) {
    case 'tx1':
      return 'dk1';
    case 'tx2':
      return 'dk2';
    case 'bg1':
      return 'lt1';
    case 'bg2':
      return 'lt2';
    case 'text1':
      return 'dk1';
    case 'text2':
      return 'dk2';
    case 'background1':
      return 'lt1';
    case 'background2':
      return 'lt2';
  }
  // 处理大小写或变体（渲染器通常会去除 'theme:' 前缀）
  return val as ThemeColorType;
}
