import { FileHandler } from '../core/FileHandler';
import { normalizePartPath } from './path';

export class ContentTypesRegistry {
  private readonly defaults = new Map<string, string>();
  private readonly overrides = new Map<string, string>();

  static fromXML(xmlString: string): ContentTypesRegistry {
    const registry = new ContentTypesRegistry();
    const doc = FileHandler.parseXML(xmlString);

    const defaultNodes = doc.querySelectorAll('Default');
    for (let i = 0; i < defaultNodes.length; i++) {
      const extension = defaultNodes[i].getAttribute('Extension');
      const contentType = defaultNodes[i].getAttribute('ContentType');

      if (extension && contentType) {
        registry.defaults.set(extension.toLowerCase(), contentType);
      }
    }

    const overrideNodes = doc.querySelectorAll('Override');
    for (let i = 0; i < overrideNodes.length; i++) {
      const partName = overrideNodes[i].getAttribute('PartName');
      const contentType = overrideNodes[i].getAttribute('ContentType');

      if (partName && contentType) {
        registry.overrides.set(normalizePartPath(partName), contentType);
      }
    }

    return registry;
  }

  getContentType(partPath: string): string | undefined {
    const normalizedPath = normalizePartPath(partPath);
    const override = this.overrides.get(normalizedPath);

    if (override) {
      return override;
    }

    const extension = normalizedPath.split('.').pop()?.toLowerCase();
    return extension ? this.defaults.get(extension) : undefined;
  }
}
