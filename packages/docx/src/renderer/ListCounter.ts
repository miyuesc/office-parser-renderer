import { NumberingDefinition, NumberingLevel } from '../types';

export class ListCounter {
    private counters: Record<string, Record<number, number>> = {}; // numId -> level -> current

    constructor(private numbering: NumberingDefinition) {}

    getNextNumber(numId: string, levelIndex: number): string {
        const num = this.numbering.nums[numId];
        if (!num) return '';
        
        const abstractNum = this.numbering.abstractNums[num.abstractNumId];
        if (!abstractNum) return '';

        const level = abstractNum.levels[levelIndex];
        if (!level) return '';

        // Initialize state if missing
        if (!this.counters[numId]) this.counters[numId] = {};
        if (this.counters[numId][levelIndex] === undefined) {
            this.counters[numId][levelIndex] = level.start - 1;
        }

        // Increment
        this.counters[numId][levelIndex]++;

        // Reset lower levels (higher index)
        // Actually in Word, if you indent, you just start a new sequence often, but 
        // strictly, if we go back up to level 0, level 1 resets? 
        // The rule is: if level L increments, levels > L should reset.
        for (let l = levelIndex + 1; l < 9; l++) {
           const subLevel = abstractNum.levels[l];
           if (subLevel) {
                this.counters[numId][l] = subLevel.start - 1;
           } else {
                delete this.counters[numId][l];
           }
        }

        // Format
        return this.formatNumber(level, this.counters[numId]);
    }

    private formatNumber(level: NumberingLevel, currentCounts: Record<number, number>): string {
        let text = level.text;
        // Replace %1, %2, etc. with formatted numbers
        text = text.replace(/%(\d+)/g, (match, lvlStr) => {
            const lvl = parseInt(lvlStr, 10) - 1; // 1-based in string, 0-based in index
            const val = currentCounts[lvl] !== undefined ? currentCounts[lvl] : 1;
            return this.convertValue(val, level.format); // Note: format should come from specific level, but here simplifiction
        });
        return text;
    }

    private convertValue(val: number, format: string): string {
        if (format === 'bullet') return '•'; // Simplification, strictly depends on font
        if (format === 'decimal') return val.toString();
        if (format === 'lowerLetter') return String.fromCharCode(96 + val);
        if (format === 'upperLetter') return String.fromCharCode(64 + val);
        // Todo: roman
        return val.toString();
    }
}
