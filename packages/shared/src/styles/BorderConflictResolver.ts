import { IBorder, BorderStyle } from './types';

/**
 * Resolves border conflicts for tables (CSS border-collapse model).
 */
export class BorderConflictResolver {
  // Style priority: larger number = higher priority
  private static readonly STYLE_PRIORITY: Record<BorderStyle, number> = {
    double: 10,
    solid: 5,
    dashed: 4,
    dotted: 3,
    none: 0
  };

  /**
   * Resolves the conflict between two borders.
   * @param borderA The first border.
   * @param borderB The second border.
   * @returns The winning border.
   */
  static resolve(borderA: IBorder | undefined, borderB: IBorder | undefined): IBorder | undefined {
    // 1. Existence check
    if (!borderA && !borderB) return undefined;
    if (!borderA) return borderB;
    if (!borderB) return borderA;

    // 2. Hidden check (if style is 'none' / 'hidden', it might win depending on model,
    // but usually 'none' loses to visible in standard OOXML unless it's explicitly 'nil')
    // MVP: 'none' loses to anything visible
    if (borderA.style === 'none' && borderB.style !== 'none') return borderB;
    if (borderB.style === 'none' && borderA.style !== 'none') return borderA;

    // 3. Width check (wider wins)
    if (borderA.width > borderB.width) return borderA;
    if (borderB.width > borderA.width) return borderB;

    // 4. Style check (priority table)
    const priorityA = this.STYLE_PRIORITY[borderA.style] || 0;
    const priorityB = this.STYLE_PRIORITY[borderB.style] || 0;

    if (priorityA > priorityB) return borderA;
    if (priorityB > priorityA) return borderB;

    // 5. Tie-breaker (e.g., color, or just prefer A)
    // Excel usually prefers consistent resolution (e.g., left/top over right/bottom?)
    // Here we just return A as default
    return borderA;
  }
}
