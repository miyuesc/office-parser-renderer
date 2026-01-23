/**
 * 水印渲染器
 *
 * 负责创建和渲染 DOCX 文档中的文本水印和图片水印
 */

import type { WatermarkConfig } from '../types';

/**
 * 水印渲染器类
 */
export class WatermarkRenderer {
  /**
   * 创建水印层
   *
   * @param config - 水印配置
   * @returns 水印 DOM 元素
   */
  static createWatermarkLayer(config: WatermarkConfig): HTMLElement {
    const layer = document.createElement('div');
    layer.className = 'docx-watermark';

    const style = layer.style;
    style.position = 'absolute';
    style.top = '0';
    style.left = '0';
    style.width = '100%';
    style.height = '100%';
    style.display = 'flex';
    style.justifyContent = 'center';
    style.alignItems = 'center';
    style.pointerEvents = 'none';
    style.zIndex = '0';
    style.overflow = 'hidden';

    if (config.type === 'text' && config.text) {
      layer.textContent = config.text;
      style.fontSize = `${config.fontSize || 72}pt`;
      style.fontFamily = config.font || '宋体';
      style.color = config.color || '#cccccc';
      style.opacity = String(config.opacity ?? 0.5);
      style.transform = `rotate(${config.rotation ?? -45}deg)`;
      style.whiteSpace = 'nowrap';
    } else if (config.type === 'image' && config.imageSrc) {
      const img = document.createElement('img');
      img.src = config.imageSrc;
      img.style.maxWidth = '80%';
      img.style.maxHeight = '80%';
      img.style.opacity = String(config.opacity ?? 0.5);
      img.style.transform = `rotate(${config.rotation ?? 0}deg)`;
      layer.appendChild(img);
    }

    return layer;
  }
}
