import { OfficeFill, OfficeStroke, OfficeTextBody, OfficeEffect, OfficeStyle } from './types';
import { ColorParser } from './parsers/ColorParser';
import { FillParser } from './parsers/FillParser';
import { EffectParser } from './parsers/EffectParser';
import { CustomGeometryParser } from './parsers/CustomGeometryParser';
import { TextBodyParser } from './parsers/TextBodyParser';
import { ShapeStyleParser } from './parsers/ShapeStyleParser';
import { ShapePropertiesParser } from './parsers/ShapePropertiesParser';

export class DrawingMLParser {
  static parseShapeProperties(node: Element): {
    fill?: OfficeFill;
    stroke?: OfficeStroke;
    geometry?: string;
    path?: string;
    pathWidth?: number;
    pathHeight?: number;
    rotation?: number;
    flipH?: boolean;
    flipV?: boolean;
    effects?: OfficeEffect[];
    adjustValues?: Record<string, number>;
  } {
    return ShapePropertiesParser.parseShapeProperties(node);
  }

  static parseStyle(node: Element): OfficeStyle | undefined {
    return ShapeStyleParser.parseStyle(node);
  }

  static parseTextBody(node: Element): OfficeTextBody | undefined {
    return TextBodyParser.parseTextBody(node);
  }

  // Exposed for backward compatibility if needed, or internal use via Facade but mostly these are private in original class
  // However, since they were private static, they might not be used outside.
  // But checking usage, DrawingMLParser was used as `DrawingMLParser.parseShapeProperties`.
  // The private ones `parseFill`, `parseEffects`, `parseColor`, `parseCustomGeometry` were internal helpers.
  // If anyone was using them (unlikely if they were private), they might break.
  // But since they were private, it's safe to assume they were not used outside.
  // I will not re-expose private methods unless necessary.
}
