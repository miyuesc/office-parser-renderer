export function getElementsByLocalName(root: ParentNode, localName: string): Element[] {
  const matches: Element[] = [];
  const all = root.querySelectorAll('*');

  for (let i = 0; i < all.length; i++) {
    const element = all[i];
    if (element.localName === localName || element.nodeName.split(':').pop() === localName) {
      matches.push(element);
    }
  }

  return matches;
}

export function getFirstElementByLocalName(root: ParentNode, localName: string): Element | undefined {
  return getElementsByLocalName(root, localName)[0];
}

export function getOptionalAttr(element: Element, name: string): string | undefined {
  return element.getAttribute(name) || element.getAttribute(name.split(':').pop() || name) || undefined;
}

export function getRequiredAttr(element: Element, name: string): string {
  const value = getOptionalAttr(element, name);
  if (value === undefined) {
    throw new Error(`Missing required XML attribute: ${name}`);
  }

  return value;
}

export function parseBooleanAttr(value: string | null | undefined, fallback = false): boolean {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return value === '1' || value.toLowerCase() === 'true';
}

export function parseNumberAttr(value: string | null | undefined, fallback = 0): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseUnitValue(value: string | null | undefined, fallback = 0): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)/);
  if (!match) {
    return fallback;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : fallback;
}
