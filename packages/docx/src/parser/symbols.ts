const LEGACY_SYMBOL_MAP: Record<string, Record<number, string>> = {
  symbol: {
    0x00b7: '•',
    0x00a7: '▪',
    0x00a8: '◦',
    0xf0b7: '•',
    0xf0a7: '▪',
    0xf0a8: '◦'
  },
  wingdings: {
    0xf06e: '■',
    0xf0a7: '▪',
    0xf0a8: '◦',
    0xf0b7: '•',
    0xf0d8: '➢',
    0xf0fc: '✓',
    0xf0fe: '☑'
  },
  'wingdings 2': {
    0xf0a7: '▪',
    0xf0fc: '✓'
  },
  'wingdings 3': {
    0xf0a7: '▪',
    0xf0fc: '✓'
  },
  webdings: {
    0xf0fc: '✓',
    0xf0fe: '☑'
  }
};

function normalizeFontKey(fontFamily?: string) {
  return (fontFamily || '').trim().toLowerCase();
}

function isPrivateUseCodePoint(codePoint: number) {
  return (
    (codePoint >= 0xe000 && codePoint <= 0xf8ff) ||
    (codePoint >= 0xf0000 && codePoint <= 0xffffd) ||
    (codePoint >= 0x100000 && codePoint <= 0x10fffd)
  );
}

function isOnlyPrivateUseOrWhitespace(text: string) {
  const visible = [...text].filter(char => !/\s/.test(char));
  return visible.length > 0 && visible.every(char => isPrivateUseCodePoint(char.codePointAt(0) || 0));
}

export function normalizeLegacySymbolText(text: string, fontFamily?: string, fallback?: string) {
  if (!text) {
    return fallback || '';
  }

  const mapping = LEGACY_SYMBOL_MAP[normalizeFontKey(fontFamily)];
  let normalized = '';

  for (const char of text) {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) {
      continue;
    }

    normalized += mapping?.[codePoint] || char;
  }

  if (fallback && isOnlyPrivateUseOrWhitespace(normalized)) {
    return fallback;
  }

  return normalized;
}

export function normalizeLegacyListMarker(text: string, fontFamily?: string) {
  const normalized = normalizeLegacySymbolText(text, fontFamily, '•').trim();
  return normalized || '•';
}
