export function normalizePartPath(path: string): string {
  const normalized = path.replace(/\\/g, '/').replace(/^\/+/, '');
  const segments: string[] = [];

  for (const segment of normalized.split('/')) {
    if (!segment || segment === '.') {
      continue;
    }

    if (segment === '..') {
      segments.pop();
      continue;
    }

    segments.push(segment);
  }

  return segments.join('/');
}

export function getPartDir(path: string): string {
  const normalized = normalizePartPath(path);
  const idx = normalized.lastIndexOf('/');

  return idx === -1 ? '' : normalized.slice(0, idx);
}

export function getPartName(path: string): string {
  const normalized = normalizePartPath(path);
  const idx = normalized.lastIndexOf('/');

  return idx === -1 ? normalized : normalized.slice(idx + 1);
}

export function resolvePartPath(basePartPath: string, target: string): string {
  if (!target) {
    return normalizePartPath(basePartPath);
  }

  if (target.startsWith('/')) {
    return normalizePartPath(target);
  }

  const baseDir = getPartDir(basePartPath);
  const baseSegments = baseDir ? baseDir.split('/') : [];

  return normalizePartPath([...baseSegments, target].join('/'));
}

export function getRelationshipsPartPath(sourcePartPath = ''): string {
  const normalizedSource = normalizePartPath(sourcePartPath);

  if (!normalizedSource) {
    return '_rels/.rels';
  }

  const dir = getPartDir(normalizedSource);
  const name = getPartName(normalizedSource);

  return dir ? `${dir}/_rels/${name}.rels` : `_rels/${name}.rels`;
}
