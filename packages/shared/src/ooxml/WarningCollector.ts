import type { FidelityWarningImpact, ParseWarning, ParseWarningSeverity } from './types';

export class WarningCollector {
  private readonly warnings: ParseWarning[] = [];

  add(warning: ParseWarning): void {
    this.warnings.push(warning);
  }

  missingPart(partPath: string, message = `Package part not found: ${partPath}`): void {
    this.add({
      code: 'package.missing-part',
      message,
      severity: 'warning',
      category: 'package',
      partPath
    });
  }

  unsupportedFeature(message: string, partPath?: string, relationshipId?: string): void {
    this.fidelityWarning('unsupported', 'renderer.unsupported-feature', message, 'info', partPath, relationshipId);
  }

  degradedFeature(message: string, partPath?: string, relationshipId?: string): void {
    this.fidelityWarning('degraded', 'renderer.degraded-feature', message, 'warning', partPath, relationshipId);
  }

  clippedContent(message: string, partPath?: string, relationshipId?: string): void {
    this.fidelityWarning('clipped', 'renderer.clipped-content', message, 'warning', partPath, relationshipId);
  }

  fallbackFeature(message: string, partPath?: string, relationshipId?: string): void {
    this.fidelityWarning('fallback', 'renderer.fallback-feature', message, 'info', partPath, relationshipId);
  }

  byImpact(impact: FidelityWarningImpact): ParseWarning[] {
    return this.warnings.filter(warning => warning.impact === impact);
  }

  private fidelityWarning(
    impact: FidelityWarningImpact,
    code: string,
    message: string,
    severity: ParseWarningSeverity,
    partPath?: string,
    relationshipId?: string
  ): void {
    this.add({
      code,
      message,
      severity,
      category: 'fidelity',
      impact,
      partPath,
      relationshipId
    });
  }

  bySeverity(severity: ParseWarningSeverity): ParseWarning[] {
    return this.warnings.filter(warning => warning.severity === severity);
  }

  toArray(): ParseWarning[] {
    return [...this.warnings];
  }
}
