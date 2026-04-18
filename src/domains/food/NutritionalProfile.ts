export enum MemberType {
    ADULT = "ADULT",
    ELDERLY = "ELDERLY",
    CHILD = "CHILD",       // roughly ages 2–12
    INFANT = "INFANT",     // under ~2 years
}

/** Derive MemberType from a birthDate at the time of the call. */
export function getMemberType(birthDate: Date): MemberType {
    const ageYears = (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (ageYears < 2)  return MemberType.INFANT;
    if (ageYears < 13) return MemberType.CHILD;
    if (ageYears >= 65) return MemberType.ELDERLY;
    return MemberType.ADULT;
}

export interface NutritionalProfile {
    calories: number;      // kcal
    proteinG: number;      // grams
    carbsG: number;        // grams
    fatG: number;          // grams
    fiberG: number;        // grams
    waterL: number;        // liters
}

export const DEFAULT_NUTRITIONAL_PROFILES: Record<MemberType, NutritionalProfile> = {
    [MemberType.ADULT]:   { calories: 2000, proteinG: 50,  carbsG: 275, fatG: 78, fiberG: 28, waterL: 2.5 },
    [MemberType.ELDERLY]: { calories: 1800, proteinG: 60,  carbsG: 230, fatG: 65, fiberG: 21, waterL: 2.0 },
    [MemberType.CHILD]:   { calories: 1500, proteinG: 35,  carbsG: 210, fatG: 55, fiberG: 20, waterL: 1.5 },
    [MemberType.INFANT]:  { calories: 800,  proteinG: 11,  carbsG: 95,  fatG: 30, fiberG: 0,  waterL: 0.8 },
};
