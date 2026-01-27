/**
 * Parser Worker
 *
 * 负责在 Web Worker 线程中执行文档解析任务，防止阻塞主线程。
 * 目前建立基础架构，后续需将解析逻辑解耦后接入。
 */

export interface ParserWorkerMessage {
  type: 'docx' | 'xlsx';
  buffer: ArrayBuffer;
}

export interface ParserWorkerResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// 防止 TS 在非 Worker 上下文中报错
declare const self: WorkerGlobalScope;

self.onmessage = async (event: MessageEvent<ParserWorkerMessage>) => {
  const { type, buffer } = event.data;
  let result;

  try {
    if (type === 'docx') {
      // TODO: 接入 DOCX 解析器
      // 需要解决依赖循环或动态加载问题
      // result = await parseDocx(buffer);
      console.warn('ParserWorker for DOCX is not yet implemented');
      result = {};
    } else if (type === 'xlsx') {
      // TODO: 接入 XLSX 解析器
      console.warn('ParserWorker for XLSX is not yet implemented');
      result = {};
    }
    self.postMessage({ success: true, data: result });
  } catch (e: any) {
    self.postMessage({ success: false, error: e.message });
  }
};
