import { ShapeRegistry, generatePresetPath, isShapeResult } from '@ai-space/shared/src/drawing/shapes';

export function renderShapeGallery(container: HTMLElement) {
  container.innerHTML = '';

  // 样式
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
  grid.style.gap = '20px';
  grid.style.padding = '20px';

  container.appendChild(grid);

  const shapes: string[] = [];

  // 遍历所有注册的形状
  Object.keys(ShapeRegistry).forEach(shapeName => {
    const generator = ShapeRegistry[shapeName];
    if (!generator) return;
    shapes.push(shapeName);

    try {
      const card = document.createElement('div');
      card.style.border = '1px solid #ddd';
      card.style.borderRadius = '8px';
      card.style.padding = '10px';
      card.style.textAlign = 'center';
      card.style.background = '#f9f9f9';

      const title = document.createElement('div');
      title.textContent = shapeName;
      title.style.marginBottom = '10px';
      title.style.fontSize = '12px';
      title.style.whiteSpace = 'nowrap';
      title.style.overflow = 'hidden';
      title.style.textOverflow = 'ellipsis';
      card.appendChild(title);

      // SVG 容器
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('width', '100');
      svg.setAttribute('height', '100');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.style.margin = '0 auto';
      svg.style.display = 'block';

      // 生成路径
      const result = generatePresetPath(shapeName, 100, 100, {});
      if (result) {
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', result.path);

        // 根据 noFill 标志设置填充
        if (result.noFill) {
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', '#4A90E2');
          path.setAttribute('stroke-width', '2');
        } else {
          path.setAttribute('fill', '#4A90E2');
          path.setAttribute('stroke', '#333');
          path.setAttribute('stroke-width', '1');
        }

        svg.appendChild(path);
      }

      card.appendChild(svg);
      grid.appendChild(card);
    } catch (e) {
      console.error(`Failed to render shape ${shapeName}`, e);
    }
  });

  console.log(`Rendered ${shapes.length} shapes`);
}
