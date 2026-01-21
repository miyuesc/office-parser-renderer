/**
 * @ai-space/shared 共享工具库
 *
 * 提供 Office 文档解析与渲染所需的通用工具：
 * - ZIP 解压服务
 * - XML 解析工具
 * - 单位转换工具
 * - 颜色处理工具
 * - DrawingML 解析与形状生成
 * - Office Math 公式解析与渲染
 * - 字体管理与 CSS 类生成
 * - 样式工具（文本、对齐、边框等）
 */

export * from './zip';
export * from './xml';
export * from './utils/geometry';
export * from './utils/ColorUtils';
export * from './utils/Units';
export * from './utils/PresetColorMap';
export * from './drawing';
export * from './math';
export * from './fonts';
export * from './fonts/FontManager';
export * from './styles';
