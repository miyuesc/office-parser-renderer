import { FileHandler } from '../core/FileHandler';
import { normalizePartPath, resolvePartPath } from './path';
import { RelationshipTarget } from './types';

export class RelationshipsResolver {
  private readonly relationships = new Map<string, RelationshipTarget>();

  constructor(private readonly sourcePartPath: string) {}

  static empty(sourcePartPath = ''): RelationshipsResolver {
    return new RelationshipsResolver(normalizePartPath(sourcePartPath));
  }

  static fromXML(xmlString: string, sourcePartPath = ''): RelationshipsResolver {
    const resolver = new RelationshipsResolver(normalizePartPath(sourcePartPath));
    const doc = FileHandler.parseXML(xmlString);
    const nodes = doc.querySelectorAll('Relationship');

    for (let i = 0; i < nodes.length; i++) {
      const id = nodes[i].getAttribute('Id');
      const target = nodes[i].getAttribute('Target');

      if (!id || !target) {
        continue;
      }

      const targetMode = nodes[i].getAttribute('TargetMode') || 'Internal';
      const type = nodes[i].getAttribute('Type') || undefined;
      const relationship: RelationshipTarget = {
        id,
        type,
        target,
        targetMode,
        sourcePartPath: resolver.sourcePartPath
      };

      if (targetMode !== 'External') {
        relationship.resolvedTarget = resolvePartPath(resolver.sourcePartPath, target);
      }

      resolver.relationships.set(id, relationship);
    }

    return resolver;
  }

  get(id: string): RelationshipTarget | undefined {
    return this.relationships.get(id);
  }

  list(): RelationshipTarget[] {
    return [...this.relationships.values()];
  }

  findByType(type: string): RelationshipTarget[] {
    return this.list().filter(relationship => relationship.type === type);
  }

  getTarget(id: string): string | undefined {
    return this.relationships.get(id)?.resolvedTarget;
  }

  toTargetMap(): Map<string, string> {
    const resolved = new Map<string, string>();

    for (const [id, relationship] of this.relationships.entries()) {
      if (relationship.resolvedTarget) {
        resolved.set(id, relationship.resolvedTarget);
      }
    }

    return resolved;
  }
}
