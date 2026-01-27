/**
 * Default List Indentation (in Twips)
 * Based on common Officer defaults.
 */
export const DEFAULT_LIST_INDENTS = {
  LEVEL_1: 720, // 0.5 inch (left: 720, hanging: 360)
  LEVEL_2: 1440, // 1.0 inch
  LEVEL_3: 2160, // 1.5 inch
  LEVEL_4: 2880,
  LEVEL_5: 3600,
  LEVEL_6: 4320,
  LEVEL_7: 5040,
  LEVEL_8: 5760,
  LEVEL_9: 6480
} as const;

/**
 * Default Tab Stops (in Twips)
 */
export const DEFAULT_TABS = {
  INTERVAL: 720 // 0.5 inch
} as const;

/**
 * Text Wrapping Modes
 */
export enum TextWrapping {
  INLINE = 'inline',
  SQUARE = 'square',
  TIGHT = 'tight',
  THROUGH = 'through',
  TOP_AND_BOTTOM = 'topAndBottom',
  BEHIND = 'behind',
  IN_FRONT = 'inFront'
}
