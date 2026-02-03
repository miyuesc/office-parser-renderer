/**
 * Manages Web Workers for off-main-thread processing.
 */
export class WebWorkerManager {
  private worker: Worker | null = null;

  constructor(workerScriptUrl: string) {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(workerScriptUrl, { type: 'module' });
    } else {
      console.warn('Web Workers are not supported in this environment.');
    }
  }

  postMessage(message: any) {
    this.worker?.postMessage(message);
  }

  onMessage(callback: (event: MessageEvent) => void) {
    if (this.worker) {
      this.worker.onmessage = callback;
    }
  }

  terminate() {
    this.worker?.terminate();
    this.worker = null;
  }
}
