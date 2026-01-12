export class LengthUtils {
    // 1 inch = 1440 twips
    // 1 inch = 96 pixels (standard screen DPI)
    static twipsToPixels(twips: number): number {
        return (twips / 1440) * 96;
    }

    // 1 inch = 914400 EMUs
    static emusToPixels(emus: number): number {
        return (emus / 914400) * 96;
    }
    
    // Points to Pixels
    static pointsToPixels(pt: number): number {
        return (pt / 72) * 96;
    }
}
