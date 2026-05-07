import { DragController, ZoomController } from '@opr/shared';

export interface DocxInteractionControllerOptions {
  container: HTMLElement;
  getDragSurface: () => HTMLElement | undefined;
  initialZoom: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  canZoom: () => boolean;
  onZoomChange: (zoom: number) => void;
}

export class DocxInteractionController {
  private dragController?: DragController;
  private dragSurface?: HTMLElement;
  private readonly zoomController: ZoomController;

  private readonly wheelHandler = (event: WheelEvent) => this.handleWheel(event);
  private readonly mouseDownHandler = (event: MouseEvent) => this.handleMouseDown(event);
  private readonly mouseMoveHandler = (event: MouseEvent) => this.dragController?.handleMouseMove(event);
  private readonly mouseUpHandler = (event: MouseEvent) => this.dragController?.handleMouseUp(event);

  constructor(private readonly options: DocxInteractionControllerOptions) {
    this.zoomController = new ZoomController({
      initialScale: options.initialZoom,
      minScale: options.minZoom ?? 0.25,
      maxScale: options.maxZoom ?? 3,
      step: options.zoomStep ?? 0.1,
      onZoomChange: zoom => options.onZoomChange(zoom)
    });

    options.container.addEventListener('wheel', this.wheelHandler, { passive: false });
  }

  bindDragSurface() {
    const surface = this.options.getDragSurface();
    if (surface === this.dragSurface) {
      return;
    }

    this.unbindDragSurface();

    if (!surface) {
      return;
    }

    this.dragSurface = surface;
    this.dragController = new DragController({
      element: surface,
      grabbingCursor: 'grabbing',
      onDrag: (dx, dy) => {
        surface.scrollLeft -= dx;
        surface.scrollTop -= dy;
      },
      onDragEnd: () => {
        surface.style.cursor = 'grab';
      }
    });

    surface.style.cursor = 'grab';
    surface.addEventListener('mousedown', this.mouseDownHandler);
    window.addEventListener('mousemove', this.mouseMoveHandler);
    window.addEventListener('mouseup', this.mouseUpHandler);
  }

  getZoom() {
    return this.zoomController.getScale();
  }

  setZoom(zoom: number, triggerCallback = true) {
    this.zoomController.setScale(zoom, triggerCallback);
    return this.zoomController.getScale();
  }

  zoomIn(step?: number) {
    if (step !== undefined) {
      return this.setZoom(this.getZoom() + step);
    }

    this.zoomController.zoomIn();
    return this.getZoom();
  }

  zoomOut(step?: number) {
    if (step !== undefined) {
      return this.setZoom(this.getZoom() - step);
    }

    this.zoomController.zoomOut();
    return this.getZoom();
  }

  getZoomElement() {
    return this.zoomController.getElement();
  }

  destroy() {
    this.options.container.removeEventListener('wheel', this.wheelHandler);
    this.unbindDragSurface();
  }

  private handleWheel(event: WheelEvent) {
    if (!event.ctrlKey || !this.options.canZoom()) {
      return;
    }

    event.preventDefault();
    this.setZoom(this.getZoom() + (event.deltaY < 0 ? 0.1 : -0.1));
  }

  private handleMouseDown(event: MouseEvent) {
    if (event.button !== 0 || this.isInteractiveTarget(event.target)) {
      return;
    }

    event.preventDefault();
    this.dragController?.handleMouseDown(event);
  }

  private isInteractiveTarget(target: EventTarget | null) {
    return target instanceof Element && !!target.closest('button, input, textarea, select, a');
  }

  private unbindDragSurface() {
    if (!this.dragSurface) {
      return;
    }

    this.dragSurface.removeEventListener('mousedown', this.mouseDownHandler);
    window.removeEventListener('mousemove', this.mouseMoveHandler);
    window.removeEventListener('mouseup', this.mouseUpHandler);
    this.dragController?.cancel();
    this.dragSurface.style.cursor = '';
    this.dragController = undefined;
    this.dragSurface = undefined;
  }
}
