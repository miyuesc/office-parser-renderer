export class XmlUtils {
    static parse(xmlString: string): Document {
        const parser = new DOMParser();
        return parser.parseFromString(xmlString, "application/xml");
    }

    /**
     * Query a single element treating namespaces loosely if needed.
     * In OOXML, strictly matching namespaces is safer, but for simplicity we often strip them or accept the local name.
     */
    static query(node: ParentNode, selector: string): Element | null {
        // First try the strict selector
        let res = node.querySelector(selector);
        if (res) return res;

        // Fallback: Try matching by local name if a namespace prefix was used
        // e.g. "xdr\\:twoCellAnchor" -> "twoCellAnchor"
        if (selector.indexOf('\\:') !== -1) {
            const localName = selector.split('\\:').pop();
            if (localName) {
                return node.querySelector(localName);
            }
        }
        return null;
    }

    static queryAll(node: ParentNode, selector: string): Element[] {
        let res = Array.from(node.querySelectorAll(selector));
        if (res.length > 0) return res;

        // Fallback: Try local name
        if (selector.indexOf('\\:') !== -1) {
            const localName = selector.split('\\:').pop();
            if (localName) {
                return Array.from(node.querySelectorAll(localName));
            }
        }
        return [];
    }
}
