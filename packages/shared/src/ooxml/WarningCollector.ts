import { ParseWarning, ParseWarningSeverity } from './types';

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
      partPath
    });
  }

  unsupportedFeature(message: string, partPath?: string): void {
    this.add({
      code: 'renderer.unsupported-feature',
      message,
      severity: 'info',
      partPath
    });
  }

  bySeverity(severity: ParseWarningSeverity): ParseWarning[] {
    return this.warnings.filter(warning => warning.severity === severity);
  }

  toArray(): ParseWarning[] {
    return [...this.warnings];
  }
}
