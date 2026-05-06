import { ColorUtils } from '@opr/shared';
import { CellRange, parseCellRange, parseCellRef } from '../model/WorksheetAccess';
import {
  Cell,
  ConditionalFormattingRule,
  ConditionalFormattingValueObject,
  ConditionalRenderStyle,
  Fill,
  Font,
  Styles,
  Worksheet,
  WorksheetConditionalFormatting
} from '../parser/types';
import { CellRenderer } from './CellRenderer';
import { ConditionalFormulaEvaluator } from './ConditionalFormulaEvaluator';
import { CellFormatUtils } from '../utils/CellFormatUtils';

interface PreparedConditionalFormatting extends WorksheetConditionalFormatting {
  ranges: CellRange[];
}

interface PreparedColorScale {
  stops: Array<{
    threshold: number;
    color: string;
  }>;
}

interface PreparedDataBar {
  lowerBound: number;
  upperBound: number;
  color: string;
  minLength: number;
  maxLength: number;
  showValue: boolean;
}

interface PreparedIconSet {
  name: string;
  thresholds: number[];
  valueObjects: ConditionalFormattingValueObject[];
  iconCount: number;
  reverse: boolean;
  showValue: boolean;
}

interface PreparedTop10 {
  cutoff: number;
  bottom: boolean;
}

interface PreparedAboveAverage {
  threshold: number;
  aboveAverage: boolean;
  equalAverage: boolean;
}

interface ConditionalFormattingEvaluatorOptions {
  now?: Date;
}

export class ConditionalFormattingEvaluator {
  private readonly blocks: PreparedConditionalFormatting[];
  private readonly duplicateCounts = new WeakMap<ConditionalFormattingRule, Map<string, number>>();
  private readonly colorScales = new WeakMap<ConditionalFormattingRule, PreparedColorScale | null>();
  private readonly dataBars = new WeakMap<ConditionalFormattingRule, PreparedDataBar | null>();
  private readonly iconSets = new WeakMap<ConditionalFormattingRule, PreparedIconSet | null>();
  private readonly top10Rules = new WeakMap<ConditionalFormattingRule, PreparedTop10 | null>();
  private readonly aboveAverageRules = new WeakMap<ConditionalFormattingRule, PreparedAboveAverage | null>();
  private readonly now: Date;

  constructor(
    private readonly worksheet: Worksheet,
    private readonly styles?: Styles,
    options: ConditionalFormattingEvaluatorOptions = {}
  ) {
    this.now = options.now ? new Date(options.now.getTime()) : new Date();
    this.blocks = (worksheet.conditionalFormattings || []).map(block => ({
      ...block,
      ranges: block.sqref.map(range => parseCellRange(range)).filter((range): range is CellRange => Boolean(range))
    }));
  }

  getStyle(row: number, col: number): ConditionalRenderStyle | undefined {
    let mergedStyle: ConditionalRenderStyle | undefined;
    let shouldStop = false;

    for (const block of this.blocks) {
      const coveredRange = this.getCoveredRange(block, row, col);
      if (!coveredRange) {
        continue;
      }

      for (const rule of block.rules) {
        const dynamicStyle = this.getDynamicStyle(block, rule, row, col);
        if (!dynamicStyle && !this.matchesRule(block, rule, row, col, coveredRange)) {
          continue;
        }

        if (dynamicStyle) {
          mergedStyle = this.mergeDifferentialStyles(mergedStyle, dynamicStyle);
        }

        if (rule.dxfId !== undefined) {
          const differentialStyle = this.styles?.differentialStyles[rule.dxfId];
          if (differentialStyle) {
            mergedStyle = this.mergeDifferentialStyles(mergedStyle, differentialStyle);
          }
        }

        if (rule.stopIfTrue) {
          shouldStop = true;
          break;
        }
      }

      if (shouldStop) {
        break;
      }
    }

    return mergedStyle;
  }

  private getDynamicStyle(
    block: PreparedConditionalFormatting,
    rule: ConditionalFormattingRule,
    row: number,
    col: number
  ): ConditionalRenderStyle | undefined {
    if (rule.type === 'colorScale') {
      return this.getColorScaleStyle(block, rule, row, col);
    }

    if (rule.type === 'dataBar') {
      return this.getDataBarStyle(block, rule, row, col);
    }

    if (rule.type === 'iconSet') {
      return this.getIconSetStyle(block, rule, row, col);
    }

    if (rule.type === 'expression') {
      return undefined;
    }

    return undefined;
  }

  private getCoveredRange(block: PreparedConditionalFormatting, row: number, col: number) {
    return block.ranges.find(
      range => range && row >= range.startRow && row <= range.endRow && col >= range.startCol && col <= range.endCol
    );
  }

  private matchesRule(
    block: PreparedConditionalFormatting,
    rule: ConditionalFormattingRule,
    row: number,
    col: number,
    coveredRange: CellRange
  ): boolean {
    const cell = this.worksheet.rows.get(row)?.cells.get(col);
    const cellText = cell ? CellRenderer.getCellText(cell, this.styles, 'value') : '';
    const comparableValue = this.getComparableValue(cell, cellText);
    const normalizedText = cellText.toLowerCase();
    const targetText = this.getRuleText(rule)?.toLowerCase();

    switch (rule.type) {
      case 'cellIs':
        return this.matchesCellIs(rule, comparableValue, row, col, coveredRange);
      case 'top10':
        return this.matchesTop10(block, rule, row, col);
      case 'aboveAverage':
        return this.matchesAboveAverage(block, rule, row, col);
      case 'timePeriod':
        return this.matchesTimePeriod(rule, row, col);
      case 'expression':
        return this.matchesExpression(rule, row, col, coveredRange);
      case 'containsText':
        return targetText ? normalizedText.includes(targetText) : false;
      case 'notContainsText':
        return targetText ? !normalizedText.includes(targetText) : false;
      case 'beginsWith':
        return targetText ? normalizedText.startsWith(targetText) : false;
      case 'endsWith':
        return targetText ? normalizedText.endsWith(targetText) : false;
      case 'duplicateValues':
        return this.matchesDuplicateRule(block, rule, row, col, true);
      case 'uniqueValues':
        return this.matchesDuplicateRule(block, rule, row, col, false);
      case 'containsBlanks':
        return cellText.length === 0;
      case 'notContainsBlanks':
        return cellText.length > 0;
      case 'colorScale':
      case 'dataBar':
      case 'iconSet':
        return false;
      default:
        return false;
    }
  }

  private matchesExpression(rule: ConditionalFormattingRule, row: number, col: number, coveredRange: CellRange) {
    const formula = rule.formulas[0];
    if (!formula) {
      return false;
    }

    return ConditionalFormulaEvaluator.evaluateBoolean(formula, {
      worksheet: this.worksheet,
      styles: this.styles,
      currentRow: row,
      currentCol: col,
      anchorRow: coveredRange.startRow,
      anchorCol: coveredRange.startCol
    });
  }

  private matchesTop10(block: PreparedConditionalFormatting, rule: ConditionalFormattingRule, row: number, col: number) {
    const prepared = this.getPreparedTop10(block, rule);
    const value = this.getNumericValue(this.worksheet.rows.get(row)?.cells.get(col));
    if (!prepared || value === undefined) {
      return false;
    }

    return prepared.bottom ? value <= prepared.cutoff : value >= prepared.cutoff;
  }

  private matchesAboveAverage(block: PreparedConditionalFormatting, rule: ConditionalFormattingRule, row: number, col: number) {
    const prepared = this.getPreparedAboveAverage(block, rule);
    const value = this.getNumericValue(this.worksheet.rows.get(row)?.cells.get(col));
    if (!prepared || value === undefined) {
      return false;
    }

    if (prepared.aboveAverage) {
      return prepared.equalAverage ? value >= prepared.threshold : value > prepared.threshold;
    }

    return prepared.equalAverage ? value <= prepared.threshold : value < prepared.threshold;
  }

  private matchesTimePeriod(rule: ConditionalFormattingRule, row: number, col: number) {
    const timePeriod = rule.timePeriod;
    if (!timePeriod) {
      return false;
    }

    const cell = this.worksheet.rows.get(row)?.cells.get(col);
    const dateValue = CellFormatUtils.getDateValue(cell, this.styles);
    const range = dateValue ? this.resolveTimePeriodRange(timePeriod) : undefined;
    if (!dateValue || !range) {
      return false;
    }

    const timestamp = dateValue.getTime();
    return timestamp >= range.start.getTime() && timestamp < range.end.getTime();
  }

  private getColorScaleStyle(
    block: PreparedConditionalFormatting,
    rule: ConditionalFormattingRule,
    row: number,
    col: number
  ): ConditionalRenderStyle | undefined {
    const value = this.getNumericValue(this.worksheet.rows.get(row)?.cells.get(col));
    if (value === undefined) {
      return undefined;
    }

    const prepared = this.getPreparedColorScale(block, rule);
    if (!prepared || prepared.stops.length < 2) {
      return undefined;
    }

    const color = this.resolveInterpolatedColor(prepared.stops, value);
    if (!color) {
      return undefined;
    }

    return {
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: color,
        bgColor: color,
        color,
        backgroundColor: color
      }
    };
  }

  private getDataBarStyle(
    block: PreparedConditionalFormatting,
    rule: ConditionalFormattingRule,
    row: number,
    col: number
  ): ConditionalRenderStyle | undefined {
    const prepared = this.getPreparedDataBar(block, rule);
    if (!prepared) {
      return undefined;
    }

    const value = this.getNumericValue(this.worksheet.rows.get(row)?.cells.get(col));
    const geometry = this.resolveDataBarGeometry(prepared, value);
    if (!geometry) {
      return undefined;
    }

    return {
      dataBar: {
        color: prepared.color,
        showValue: prepared.showValue,
        ...geometry
      }
    };
  }

  private getIconSetStyle(
    block: PreparedConditionalFormatting,
    rule: ConditionalFormattingRule,
    row: number,
    col: number
  ): ConditionalRenderStyle | undefined {
    const prepared = this.getPreparedIconSet(block, rule);
    if (!prepared) {
      return undefined;
    }

    const value = this.getNumericValue(this.worksheet.rows.get(row)?.cells.get(col));
    if (value === undefined) {
      return undefined;
    }

    const iconIndex = this.resolveIconSetIndex(prepared, value);
    return {
      iconSet: {
        name: prepared.name,
        iconIndex,
        iconCount: prepared.iconCount,
        showValue: prepared.showValue
      }
    };
  }

  private getPreparedColorScale(block: PreparedConditionalFormatting, rule: ConditionalFormattingRule) {
    const cached = this.colorScales.get(rule);
    if (cached !== undefined) {
      return cached || undefined;
    }

    const colorScale = rule.colorScale;
    if (!colorScale || colorScale.values.length !== colorScale.colors.length || colorScale.values.length < 2) {
      this.colorScales.set(rule, null);
      return undefined;
    }

    const numericValues = this.collectNumericValues(block);
    if (numericValues.length === 0) {
      this.colorScales.set(rule, null);
      return undefined;
    }

    const stops = colorScale.values.map((valueObject, index) => {
      const threshold = this.resolveColorScaleThreshold(valueObject, numericValues);
      const color =
        colorScale.colors[index]?.color ||
        ColorUtils.resolveColorRef(colorScale.colors[index]?.colorRef, this.styles?.theme);

      if (threshold === undefined || !color) {
        return undefined;
      }

      return {
        threshold,
        color
      };
    });

    if (stops.some(stop => !stop)) {
      this.colorScales.set(rule, null);
      return undefined;
    }

    const prepared = {
      stops: (stops as PreparedColorScale['stops']).slice().sort((left, right) => left.threshold - right.threshold)
    };
    this.colorScales.set(rule, prepared);
    return prepared;
  }

  private collectNumericValues(block: PreparedConditionalFormatting) {
    const values: number[] = [];

    for (const range of block.ranges) {
      if (!range) {
        continue;
      }

      for (let row = range.startRow; row <= range.endRow; row++) {
        for (let col = range.startCol; col <= range.endCol; col++) {
          const value = this.getNumericValue(this.worksheet.rows.get(row)?.cells.get(col));
          if (value !== undefined) {
            values.push(value);
          }
        }
      }
    }

    return values.sort((left, right) => left - right);
  }

  private resolveColorScaleThreshold(valueObject: NonNullable<ConditionalFormattingRule['colorScale']>['values'][number], values: number[]) {
    return this.resolveThresholdValueObject(valueObject, values);
  }

  private getPreparedDataBar(block: PreparedConditionalFormatting, rule: ConditionalFormattingRule) {
    const cached = this.dataBars.get(rule);
    if (cached !== undefined) {
      return cached || undefined;
    }

    const dataBar = rule.dataBar;
    if (!dataBar || dataBar.values.length < 2) {
      this.dataBars.set(rule, null);
      return undefined;
    }

    const numericValues = this.collectNumericValues(block);
    if (numericValues.length === 0) {
      this.dataBars.set(rule, null);
      return undefined;
    }

    const first = this.resolveThresholdValueObject(dataBar.values[0], numericValues);
    const second = this.resolveThresholdValueObject(dataBar.values[1], numericValues);
    const color = dataBar.color || ColorUtils.resolveColorRef(dataBar.colorRef, this.styles?.theme);

    if (first === undefined || second === undefined || !color) {
      this.dataBars.set(rule, null);
      return undefined;
    }

    const prepared = {
      lowerBound: Math.min(first, second),
      upperBound: Math.max(first, second),
      color,
      minLength: this.clampPercentage(dataBar.minLength ?? 10),
      maxLength: this.clampPercentage(dataBar.maxLength ?? 90),
      showValue: dataBar.showValue !== false
    };

    if (prepared.maxLength < prepared.minLength) {
      prepared.maxLength = prepared.minLength;
    }

    this.dataBars.set(rule, prepared);
    return prepared;
  }

  private getPreparedIconSet(block: PreparedConditionalFormatting, rule: ConditionalFormattingRule) {
    const cached = this.iconSets.get(rule);
    if (cached !== undefined) {
      return cached || undefined;
    }

    const iconSet = rule.iconSet;
    if (!iconSet || iconSet.values.length < 2) {
      this.iconSets.set(rule, null);
      return undefined;
    }

    const numericValues = this.collectNumericValues(block);
    if (numericValues.length === 0) {
      this.iconSets.set(rule, null);
      return undefined;
    }

    const thresholds = iconSet.values.map(valueObject => this.resolveThresholdValueObject(valueObject, numericValues));
    if (thresholds.some(threshold => threshold === undefined)) {
      this.iconSets.set(rule, null);
      return undefined;
    }

    const prepared = {
      name: iconSet.name || this.getDefaultIconSetName(iconSet.values.length),
      thresholds: thresholds as number[],
      valueObjects: iconSet.values,
      iconCount: iconSet.values.length,
      reverse: iconSet.reverse === true,
      showValue: iconSet.showValue !== false
    };

    this.iconSets.set(rule, prepared);
    return prepared;
  }

  private getPreparedTop10(block: PreparedConditionalFormatting, rule: ConditionalFormattingRule) {
    const cached = this.top10Rules.get(rule);
    if (cached !== undefined) {
      return cached || undefined;
    }

    const numericValues = this.collectNumericValues(block);
    if (numericValues.length === 0) {
      this.top10Rules.set(rule, null);
      return undefined;
    }

    const rank = Math.max(1, rule.rank ?? 10);
    const count = rule.percent ? Math.max(1, Math.ceil((rank / 100) * numericValues.length)) : Math.min(rank, numericValues.length);
    const sorted = numericValues.slice().sort((left, right) => (rule.bottom ? left - right : right - left));
    const cutoff = sorted[Math.max(0, Math.min(sorted.length - 1, count - 1))];

    const prepared = {
      cutoff,
      bottom: rule.bottom === true
    };

    this.top10Rules.set(rule, prepared);
    return prepared;
  }

  private getPreparedAboveAverage(block: PreparedConditionalFormatting, rule: ConditionalFormattingRule) {
    const cached = this.aboveAverageRules.get(rule);
    if (cached !== undefined) {
      return cached || undefined;
    }

    const numericValues = this.collectNumericValues(block);
    if (numericValues.length === 0) {
      this.aboveAverageRules.set(rule, null);
      return undefined;
    }

    const average = numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
    const deviationCount = Math.max(0, rule.stdDev ?? 0);
    const variance =
      numericValues.reduce((sum, value) => sum + (value - average) * (value - average), 0) / numericValues.length;
    const stdDeviation = Math.sqrt(variance);
    const thresholdOffset = deviationCount > 0 ? stdDeviation * deviationCount : 0;

    const prepared = {
      threshold: average + (rule.aboveAverage === false ? -thresholdOffset : thresholdOffset),
      aboveAverage: rule.aboveAverage !== false,
      equalAverage: rule.equalAverage === true
    };

    this.aboveAverageRules.set(rule, prepared);
    return prepared;
  }

  private resolveTimePeriodRange(timePeriod: string) {
    const today = this.startOfDay(this.now);

    switch (timePeriod) {
      case 'today':
        return this.createDayRange(today);
      case 'yesterday':
        return this.createDayRange(this.addDays(today, -1));
      case 'tomorrow':
        return this.createDayRange(this.addDays(today, 1));
      case 'last7Days':
        return {
          start: this.addDays(today, -6),
          end: this.addDays(today, 1)
        };
      case 'thisWeek':
        return this.createWeekRange(0);
      case 'lastWeek':
        return this.createWeekRange(-1);
      case 'nextWeek':
        return this.createWeekRange(1);
      case 'thisMonth':
        return this.createMonthRange(today.getFullYear(), today.getMonth());
      case 'lastMonth':
        return this.createMonthRange(today.getFullYear(), today.getMonth() - 1);
      case 'nextMonth':
        return this.createMonthRange(today.getFullYear(), today.getMonth() + 1);
      default:
        return undefined;
    }
  }

  private createDayRange(start: Date) {
    return {
      start,
      end: this.addDays(start, 1)
    };
  }

  private createWeekRange(weekOffset: number) {
    // Excel preset week buckets are locale-sensitive; use Sunday-start semantics for the current MVP.
    const start = this.addDays(this.startOfWeek(this.now), weekOffset * 7);
    return {
      start,
      end: this.addDays(start, 7)
    };
  }

  private createMonthRange(year: number, month: number) {
    const start = new Date(year, month, 1);
    return {
      start,
      end: new Date(year, month + 1, 1)
    };
  }

  private startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private startOfWeek(date: Date) {
    const start = this.startOfDay(date);
    return this.addDays(start, -start.getDay());
  }

  private addDays(date: Date, days: number) {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
  }

  private resolveThresholdValueObject(valueObject: ConditionalFormattingValueObject, values: number[]) {
    const min = values[0];
    const max = values[values.length - 1];

    switch (valueObject.type) {
      case 'min':
      case 'autoMin':
        return min;
      case 'max':
      case 'autoMax':
        return max;
      case 'num':
        return this.parseNumericThreshold(valueObject.value);
      case 'percent': {
        const percent = this.parseNumericThreshold(valueObject.value);
        return percent === undefined ? undefined : min + (max - min) * (percent / 100);
      }
      case 'percentile': {
        const percentile = this.parseNumericThreshold(valueObject.value);
        return percentile === undefined ? undefined : this.getPercentileValue(values, percentile);
      }
      case 'formula': {
        const resolved = this.resolveFormulaOperand(valueObject.value);
        return typeof resolved === 'number' ? resolved : this.parseNumericThreshold(String(resolved ?? ''));
      }
      default:
        return this.parseNumericThreshold(valueObject.value);
    }
  }

  private resolveDataBarGeometry(prepared: PreparedDataBar, value: number | undefined) {
    if (value === undefined) {
      return undefined;
    }

    const { lowerBound, upperBound, minLength, maxLength } = prepared;
    if (value === 0 && lowerBound === 0 && upperBound === 0) {
      return {
        xRatio: 0,
        widthRatio: 0
      };
    }

    if (lowerBound >= 0) {
      const clampedValue = Math.min(upperBound, Math.max(lowerBound, value));
      if (clampedValue <= 0) {
        return { xRatio: 0, widthRatio: 0 };
      }

      const relative = upperBound === lowerBound ? 1 : (clampedValue - lowerBound) / (upperBound - lowerBound);
      return {
        xRatio: 0,
        widthRatio: this.interpolateDataBarLength(relative, minLength, maxLength)
      };
    }

    if (upperBound <= 0) {
      const clampedValue = Math.max(lowerBound, Math.min(upperBound, value));
      if (clampedValue >= 0) {
        return { xRatio: 1, widthRatio: 0 };
      }

      const relative = upperBound === lowerBound ? 1 : (upperBound - clampedValue) / (upperBound - lowerBound);
      const widthRatio = this.interpolateDataBarLength(relative, minLength, maxLength);
      return {
        xRatio: 1 - widthRatio,
        widthRatio
      };
    }

    const zeroRatio = (0 - lowerBound) / (upperBound - lowerBound);
    if (value > 0) {
      const clampedValue = Math.min(upperBound, Math.max(0, value));
      const relative = upperBound === 0 ? 0 : clampedValue / upperBound;
      const widthRatio = (1 - zeroRatio) * this.interpolateDataBarLength(relative, minLength, maxLength);
      return {
        xRatio: zeroRatio,
        widthRatio
      };
    }

    if (value < 0) {
      const clampedValue = Math.max(lowerBound, Math.min(0, value));
      const relative = lowerBound === 0 ? 0 : Math.abs(clampedValue / lowerBound);
      const widthRatio = zeroRatio * this.interpolateDataBarLength(relative, minLength, maxLength);
      return {
        xRatio: zeroRatio - widthRatio,
        widthRatio
      };
    }

    return {
      xRatio: zeroRatio,
      widthRatio: 0
    };
  }

  private resolveIconSetIndex(prepared: PreparedIconSet, value: number) {
    let iconIndex = 0;

    for (let index = 1; index < prepared.thresholds.length; index++) {
      const threshold = prepared.thresholds[index];
      const inclusive = prepared.valueObjects[index]?.gte !== false;
      if (inclusive ? value >= threshold : value > threshold) {
        iconIndex = index;
      }
    }

    return prepared.reverse ? prepared.iconCount - 1 - iconIndex : iconIndex;
  }

  private interpolateDataBarLength(relative: number, minLength: number, maxLength: number) {
    const clamped = Math.min(1, Math.max(0, relative));
    return (minLength + clamped * (maxLength - minLength)) / 100;
  }

  private clampPercentage(value: number) {
    return Math.min(100, Math.max(0, value));
  }

  private getDefaultIconSetName(iconCount: number) {
    switch (iconCount) {
      case 4:
        return '4Arrows';
      case 5:
        return '5Arrows';
      default:
        return '3Arrows';
    }
  }

  private parseNumericThreshold(value?: string) {
    if (!value) {
      return undefined;
    }

    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  private getPercentileValue(values: number[], percentile: number) {
    if (values.length === 1) {
      return values[0];
    }

    const clamped = Math.min(100, Math.max(0, percentile));
    const index = (clamped / 100) * (values.length - 1);
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);

    if (lowerIndex === upperIndex) {
      return values[lowerIndex];
    }

    const ratio = index - lowerIndex;
    return values[lowerIndex] + (values[upperIndex] - values[lowerIndex]) * ratio;
  }

  private resolveInterpolatedColor(stops: PreparedColorScale['stops'], value: number) {
    if (stops.length === 0) {
      return undefined;
    }

    if (value <= stops[0].threshold) {
      return stops[0].color;
    }

    if (value >= stops[stops.length - 1].threshold) {
      return stops[stops.length - 1].color;
    }

    for (let index = 0; index < stops.length - 1; index++) {
      const start = stops[index];
      const end = stops[index + 1];
      if (value > end.threshold) {
        continue;
      }

      const distance = end.threshold - start.threshold;
      if (distance <= 0) {
        return end.color;
      }

      return ColorUtils.interpolateColor(start.color, end.color, (value - start.threshold) / distance) || end.color;
    }

    return stops[stops.length - 1].color;
  }

  private matchesCellIs(
    rule: ConditionalFormattingRule,
    value: string | number | boolean | undefined,
    row: number,
    col: number,
    coveredRange: CellRange
  ) {
    if (value === undefined) {
      return false;
    }

    const firstOperand = this.resolveRuleFormulaOperand(rule.formulas[0], row, col, coveredRange);
    const secondOperand = this.resolveRuleFormulaOperand(rule.formulas[1], row, col, coveredRange);

    switch (rule.operator) {
      case 'equal':
        return this.areValuesEqual(value, firstOperand);
      case 'notEqual':
        return !this.areValuesEqual(value, firstOperand);
      case 'greaterThan':
        return this.compareValues(value, firstOperand) > 0;
      case 'greaterThanOrEqual':
        return this.compareValues(value, firstOperand) >= 0;
      case 'lessThan':
        return this.compareValues(value, firstOperand) < 0;
      case 'lessThanOrEqual':
        return this.compareValues(value, firstOperand) <= 0;
      case 'between':
        return this.compareValues(value, firstOperand) >= 0 && this.compareValues(value, secondOperand) <= 0;
      case 'notBetween':
        return this.compareValues(value, firstOperand) < 0 || this.compareValues(value, secondOperand) > 0;
      default:
        return false;
    }
  }

  private resolveRuleFormulaOperand(formula: string | undefined, row: number, col: number, coveredRange: CellRange) {
    if (!formula) {
      return undefined;
    }

    const evaluated = ConditionalFormulaEvaluator.evaluateScalar(formula, {
      worksheet: this.worksheet,
      styles: this.styles,
      currentRow: row,
      currentCol: col,
      anchorRow: coveredRange.startRow,
      anchorCol: coveredRange.startCol
    });

    return evaluated ?? this.resolveFormulaOperand(formula);
  }

  private matchesDuplicateRule(
    block: PreparedConditionalFormatting,
    rule: ConditionalFormattingRule,
    row: number,
    col: number,
    duplicate: boolean
  ) {
    const counts = this.getDuplicateCounts(block, rule);
    const key = this.getDuplicateKey(this.worksheet.rows.get(row)?.cells.get(col));
    if (!key) {
      return false;
    }

    const count = counts.get(key) || 0;
    return duplicate ? count > 1 : count === 1;
  }

  private getDuplicateCounts(block: PreparedConditionalFormatting, rule: ConditionalFormattingRule) {
    const cached = this.duplicateCounts.get(rule);
    if (cached) {
      return cached;
    }

    const counts = new Map<string, number>();

    for (const range of block.ranges) {
      if (!range) {
        continue;
      }

      for (let row = range.startRow; row <= range.endRow; row++) {
        for (let col = range.startCol; col <= range.endCol; col++) {
          const key = this.getDuplicateKey(this.worksheet.rows.get(row)?.cells.get(col));
          if (!key) {
            continue;
          }

          counts.set(key, (counts.get(key) || 0) + 1);
        }
      }
    }

    this.duplicateCounts.set(rule, counts);
    return counts;
  }

  private getDuplicateKey(cell?: Cell) {
    const text = cell ? CellRenderer.getCellText(cell, this.styles, 'value') : '';
    if (text.length === 0) {
      return undefined;
    }

    if (typeof cell?.value === 'number' || typeof cell?.value === 'boolean') {
      return String(cell.value);
    }

    return text.toLowerCase();
  }

  private getComparableValue(cell: Cell | undefined, cellText: string) {
    if (!cell) {
      return undefined;
    }

    if (typeof cell.value === 'number' || typeof cell.value === 'boolean') {
      return cell.value;
    }

    return cellText;
  }

  private getNumericValue(cell: Cell | undefined) {
    if (!cell) {
      return undefined;
    }

    if (typeof cell.value === 'number') {
      return Number.isFinite(cell.value) ? cell.value : undefined;
    }

    if (typeof cell.value === 'string' && cell.value.trim().length > 0) {
      const numeric = Number(cell.value);
      return Number.isFinite(numeric) ? numeric : undefined;
    }

    return undefined;
  }

  private resolveFormulaOperand(formula?: string): string | number | boolean | undefined {
    if (!formula) {
      return undefined;
    }

    const trimmed = formula.trim();
    if (!trimmed) {
      return undefined;
    }

    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return trimmed.slice(1, -1).replace(/""/g, '"');
    }

    if (/^(TRUE|FALSE)$/i.test(trimmed)) {
      return trimmed.toUpperCase() === 'TRUE';
    }

    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }

    const ref = this.extractCellReference(trimmed);
    if (ref) {
      const address = parseCellRef(ref);
      const cell = address ? this.worksheet.rows.get(address.row)?.cells.get(address.col) : undefined;
      return this.getComparableValue(cell, cell ? CellRenderer.getCellText(cell, this.styles, 'value') : '');
    }

    return undefined;
  }

  private extractCellReference(formula: string) {
    const cleaned = formula.replace(/\$/g, '');
    const lastBang = cleaned.lastIndexOf('!');
    const ref = lastBang >= 0 ? cleaned.slice(lastBang + 1) : cleaned;
    return /^[A-Z]+[1-9][0-9]*$/i.test(ref) ? ref.toUpperCase() : undefined;
  }

  private getRuleText(rule: ConditionalFormattingRule) {
    if (rule.text) {
      return rule.text;
    }

    for (const formula of rule.formulas) {
      const match = formula.match(/"((?:[^"]|"")+)"/);
      if (match) {
        return match[1].replace(/""/g, '"');
      }
    }

    return undefined;
  }

  private compareValues(left: string | number | boolean | undefined, right: string | number | boolean | undefined) {
    if (left === undefined || right === undefined) {
      return Number.NaN;
    }

    if (typeof left === 'number' && typeof right === 'number') {
      return left - right;
    }

    if (typeof left === 'boolean' && typeof right === 'boolean') {
      return Number(left) - Number(right);
    }

    return String(left).localeCompare(String(right), undefined, { sensitivity: 'base' });
  }

  private areValuesEqual(left: string | number | boolean | undefined, right: string | number | boolean | undefined) {
    if (left === undefined || right === undefined) {
      return false;
    }

    if (typeof left === typeof right) {
      return left === right;
    }

    return String(left).toLowerCase() === String(right).toLowerCase();
  }

  private mergeDifferentialStyles(
    base: ConditionalRenderStyle | undefined,
    overlay: ConditionalRenderStyle | undefined
  ): ConditionalRenderStyle | undefined {
    if (!overlay) {
      return base;
    }

    return {
      font: this.mergeFont(base?.font, overlay.font),
      fill: this.mergeFill(base?.fill, overlay.fill),
      border: overlay.border || base?.border,
      dataBar: overlay.dataBar || base?.dataBar,
      iconSet: overlay.iconSet || base?.iconSet
    };
  }

  private mergeFont(base: Font | undefined, overlay: Font | undefined) {
    if (!overlay) {
      return base;
    }

    return {
      ...(base || {}),
      ...overlay
    };
  }

  private mergeFill(base: Fill | undefined, overlay: Fill | undefined) {
    if (!overlay) {
      return base;
    }

    return {
      ...(base || { type: overlay.type }),
      ...overlay
    } as Fill;
  }
}
