import { XmlUtils } from '@ai-space/shared';

export class RelationshipsParser {
    static parse(xmlString: string): Record<string, string> {
        const doc = XmlUtils.parse(xmlString);
        const rels: Record<string, string> = {};
        
        const relationships = XmlUtils.queryAll(doc, 'Relationship');
        relationships.forEach((rel: Element) => {
            const id = rel.getAttribute('Id');
            const target = rel.getAttribute('Target');
            if (id && target) {
                rels[id] = target;
            }
        });
        
        return rels;
    }
}
