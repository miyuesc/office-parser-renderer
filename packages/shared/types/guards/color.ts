import { Color, RgbColor, SchemeColor, SystemColor, PresetColor } from '../definitions/color';
import { ST_SystemColorVal, ST_SchemeColorVal, ST_PresetColorVal } from '@ai-space/definitions/autogen/dml-baseTypes';

export function isRgbColor(val: unknown): val is RgbColor {
  return (
    typeof val === 'object' &&
    val !== null &&
    (val as any).type === 'rgb' &&
    typeof (val as any).r === 'number' &&
    typeof (val as any).g === 'number' &&
    typeof (val as any).b === 'number'
  );
}

export function isSchemeColor(val: unknown): val is SchemeColor {
  return (
    typeof val === 'object' &&
    val !== null &&
    (val as any).type === 'scheme' &&
    (typeof (val as any).value === 'string' || Object.values(ST_SchemeColorVal).includes((val as any).value))
  );
}

export function isSystemColor(val: unknown): val is SystemColor {
  return (
    typeof val === 'object' &&
    val !== null &&
    (val as any).type === 'system' &&
    (typeof (val as any).value === 'string' || Object.values(ST_SystemColorVal).includes((val as any).value))
  );
}

export function isPresetColor(val: unknown): val is PresetColor {
  return (
    typeof val === 'object' &&
    val !== null &&
    (val as any).type === 'preset' &&
    (typeof (val as any).value === 'string' || Object.values(ST_PresetColorVal).includes((val as any).value))
  );
}

export function isColor(val: unknown): val is Color {
  return typeof val === 'string' || isRgbColor(val) || isSchemeColor(val) || isSystemColor(val) || isPresetColor(val);
}
