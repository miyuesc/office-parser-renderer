/**
 * 媒体资源解析器
 *
 * 解析文档中的图片和其他媒体资源
 */

import { Logger } from '../utils/Logger';
import { RelationshipsParser, RelationshipInfo } from './RelationshipsParser';

const log = Logger.createTagged('MediaParser');

/**
 * 媒体资源接口
 */
export interface MediaResource {
  /** 关系 ID */
  id: string;
  /** 文件路径 */
  path: string;
  /** MIME 类型 */
  mimeType: string;
  /** 二进制数据 */
  data: Uint8Array;
  /** Blob URL */
  blobUrl?: string;
}

/**
 * 媒体解析结果接口
 */
export interface MediaParseResult {
  /** 图片资源映射 (rId -> MediaResource) */
  images: Record<string, MediaResource>;
  /** 图片 Blob URL 映射 (rId -> URL) */
  imageUrls: Record<string, string>;
}

/**
 * 媒体资源解析器类
 */
export class MediaParser {
  /** MIME 类型映射 */
  private static readonly MIME_TYPES: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.emf': 'image/emf',
    '.wmf': 'image/wmf'
  };

  /**
   * 解析所有媒体资源
   *
   * @param files - ZIP 文件映射
   * @param relationships - 关系信息数组
   * @returns 媒体解析结果
   */
  static parse(files: Record<string, Uint8Array>, relationships: RelationshipInfo[]): MediaParseResult {
    const result: MediaParseResult = {
      images: {},
      imageUrls: {}
    };

    // 过滤出图片关系
    const imageRels = RelationshipsParser.filterByType(relationships, RelationshipsParser.TYPES.IMAGE);

    for (const rel of imageRels) {
      const resource = this.loadResource(files, rel);
      if (resource) {
        result.images[rel.id] = resource;
        if (resource.blobUrl) {
          result.imageUrls[rel.id] = resource.blobUrl;
        }
      }
    }

    log.info(`加载了 ${Object.keys(result.images).length} 个图片资源`);
    return result;
  }

  /**
   * 加载单个资源
   *
   * @param files - ZIP 文件映射
   * @param rel - 关系信息
   * @returns MediaResource 对象或 null
   */
  private static loadResource(files: Record<string, Uint8Array>, rel: RelationshipInfo): MediaResource | null {
    // 外部链接不加载
    if (rel.targetMode === 'External') {
      log.debug(`跳过外部资源: ${rel.target}`);
      return null;
    }

    // 解析路径
    const path = RelationshipsParser.resolveTarget('word/document.xml', rel.target);
    const data = files[path];

    if (!data) {
      log.warn(`资源文件不存在: ${path}`);
      return null;
    }

    // 获取 MIME 类型
    const mimeType = this.getMimeType(path);

    // 创建 Blob URL
    let blobUrl: string | undefined;
    if (typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
      try {
        const blob = new Blob([data], { type: mimeType });
        blobUrl = URL.createObjectURL(blob);
      } catch (e) {
        log.warn(`创建 Blob URL 失败: ${path}`, e);
      }
    }

    return {
      id: rel.id,
      path,
      mimeType,
      data,
      blobUrl
    };
  }

  /**
   * 获取 MIME 类型
   *
   * @param path - 文件路径
   * @returns MIME 类型
   */
  private static getMimeType(path: string): string {
    const lowerPath = path.toLowerCase();
    for (const [ext, mimeType] of Object.entries(this.MIME_TYPES)) {
      if (lowerPath.endsWith(ext)) {
        return mimeType;
      }
    }
    return 'application/octet-stream';
  }

  /**
   * 释放所有 Blob URL
   *
   * @param result - 媒体解析结果
   */
  static releaseUrls(result: MediaParseResult): void {
    if (typeof URL !== 'undefined') {
      for (const url of Object.values(result.imageUrls)) {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // 忽略释放错误
        }
      }
    }
  }

  /**
   * 通过路径获取资源
   *
   * @param files - ZIP 文件映射
   * @param path - 资源路径
   * @returns MediaResource 对象或 null
   */
  static getResourceByPath(files: Record<string, Uint8Array>, path: string): MediaResource | null {
    // 清理路径
    let cleanPath = path;
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }

    const data = files[cleanPath];
    if (!data) {
      return null;
    }

    const mimeType = this.getMimeType(cleanPath);

    let blobUrl: string | undefined;
    if (typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
      try {
        const blob = new Blob([data], { type: mimeType });
        blobUrl = URL.createObjectURL(blob);
      } catch (e) {
        // 忽略错误
      }
    }

    return {
      id: '',
      path: cleanPath,
      mimeType,
      data,
      blobUrl
    };
  }

  /**
   * 检查路径是否为图片
   *
   * @param path - 文件路径
   * @returns 是否为图片
   */
  static isImagePath(path: string): boolean {
    const lowerPath = path.toLowerCase();
    return Object.keys(this.MIME_TYPES).some(ext => lowerPath.endsWith(ext));
  }

  /**
   * 获取支持的图片扩展名
   *
   * @returns 扩展名数组
   */
  static getSupportedExtensions(): string[] {
    return Object.keys(this.MIME_TYPES);
  }
}
