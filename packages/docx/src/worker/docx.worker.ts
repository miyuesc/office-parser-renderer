/* eslint-disable no-restricted-globals */
import { DocxParser } from '../parser/DocxParser';

/**
 * Docx 解析 Worker
 *
 * 接收原始文件数据，在 Worker 线程中实例化 DocxParser 进行解析，
 * 并将解析结果（DOCX JSON 结构）传回主线程。
 */

// 定义 Worker 消息格式
interface WorkerMessage {
  type: string;
  input: File | ArrayBuffer | Uint8Array;
}

// 监听主线程消息
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, input } = e.data;

  if (type === 'parse') {
    try {
      const parser = new DocxParser();
      // 执行解析
      const doc = await parser.parse(input);

      // 返回成功结果
      self.postMessage({
        success: true,
        data: doc,
      });
    } catch (error: any) {
      // 返回错误信息
      self.postMessage({
        success: false,
        error: error.message || 'Unknown error during parsing',
      });
    }
  }
};
