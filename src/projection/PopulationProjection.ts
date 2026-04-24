/**
 * Pure population needs projection.
 *
 * Given a community size, computes expected demographics, food requirements,
 * healthcare staffing, and labor distribution. All constants sourced from
 * docs/labor-and-demographics.md, docs/healthcare.md, and
 * src/domains/food/NutritionalProfile.ts.
 *
 * No singletons, no I/O — safe to call from anywhere.
 */

export interface Range {
    min: number;
    max: number;
}

export interface DemographicProjection {
    /** Total population. */
    total: number;
    /** Age < 2 (~3% of population). */
    infants: number;
    /** Age 2–12 (~13%). */
    children: number;
    /** Age 13–64 (~64%). */
    adults: number;
    /** Age 65+ (~20%). */
    elderly: number;
    /**
     * Estimated full-time-equivalent workers available for community labor.
     * ~46% of population, after accounting for caregivers, disabled, and trainees.
     */
    availableFTEs: number;
    /** (non-workers) / workers. Healthy target: below 1.8. */
    dependencyRatio: number;
}

export interface NutritionalNeeds {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
    waterL: number;
}

export interface FoodProjection {
    /** Community-wide totals per day. */
    daily: NutritionalNeeds;
    /** Community-wide totals per year (daily × 365). */
    annual: NutritionalNeeds;
}

export interface HealthcareProjection {
    /**
     * Generalist physicians needed.
     * Assumes a panel size of 1,750 patients each (midpoint of 1,500–2,000).
     */
    physicians: number;
    /**
     * Dental hygienists needed.
     * 2 cleanings/member/year; each hygienist handles ~4,000 appointments/year.
     */
    dentalHygienists: number;
    /**
     * Mental health providers needed.
     * ~20% of the population needs support in any given year; caseload of 50 each.
     */
    mentalHealthProviders: number;
    /** Expected annual births (~13 per 1,000). */
    annualBirths: number;
    /** Expected annual deaths (~9 per 1,000). */
    annualDeaths: number;
    /**
     * Expected annual primary care visits.
     * ~3 visits per person per year under a preventive-care model.
     */
    annualPrimaryCareVisits: number;
}

export interface LaborDomainProjection {
    name: string;
    /** FTE range needed for this domain at the given population size. */
    ftes: Range;
}

export interface LaborProjection {
    /** Total available FTEs (~46% of population). */
    availableFTEs: number;
    /** Per-domain FTE requirements. */
    domains: LaborDomainProjection[];
    /** Sum of all domain minimums and maximums. */
    totalRequired: Range;
    /**
     * Estimated reserve = availableFTEs − totalRequired.
     * Healthy minimum reserve is 15–20% of availableFTEs.
     */
    reserve: Range;
}

export interface PopulationProjection {
    demographics: DemographicProjection;
    food: FoodProjection;
    healthcare: HealthcareProjection;
    labor: LaborProjection;
}

// Per-1,000-member FTE ranges from docs/labor-and-demographics.md
const LABOR_DOMAINS: { name: string; perK: Range }[] = [
    { name: "Agriculture",                    perK: { min: 40, max: 60 } },
    { name: "Food processing & distribution", perK: { min: 15, max: 25 } },
    { name: "Healthcare",                     perK: { min: 20, max: 35 } },
    { name: "Education",                      perK: { min: 20, max: 30 } },
    { name: "Child care",                     perK: { min: 15, max: 20 } },
    { name: "Dependency care",                perK: { min: 20, max: 30 } },
    { name: "Housing & construction",         perK: { min: 15, max: 25 } },
    { name: "Manufacturing",                  perK: { min: 10, max: 15 } },
    { name: "Water",                          perK: { min:  3, max:  5 } },
    { name: "Energy",                         perK: { min:  5, max:  8 } },
    { name: "Sanitation",                     perK: { min:  5, max:  8 } },
    { name: "Fire",                           perK: { min:  5, max:  8 } },
    { name: "Logistics",                      perK: { min: 10, max: 15 } },
    { name: "Communications",                 perK: { min:  4, max:  6 } },
    { name: "Justice",                        perK: { min:  3, max:  5 } },
    { name: "Enrichment",                     perK: { min:  4, max:  6 } },
    { name: "Governance & admin",             perK: { min:  5, max:  8 } },
];

function r(n: number): number { return Math.round(n); }

/**
 * Project community-wide needs for a population of `size` members.
 *
 * @param size - Total number of members. Must be a positive integer.
 */
export function projectPopulation(size: number): PopulationProjection {
    if (!Number.isFinite(size) || size <= 0) {
        throw new Error(`Population size must be a positive finite number, got ${size}`);
    }

    // ── Demographics ──────────────────────────────────────────────────────────
    // Age distribution fractions from docs/labor-and-demographics.md
    const infants  = r(size * 0.03);   // <2:   ~3%
    const children = r(size * 0.13);   // 2–12: ~13%
    const elderly  = r(size * 0.20);   // 65+:  ~20%
    const adults   = size - infants - children - elderly; // 13–64: remainder (~64%)

    const availableFTEs = r(size * 0.46);
    const dependencyRatio = availableFTEs > 0
        ? Math.round(((size - availableFTEs) / availableFTEs) * 100) / 100
        : 0;

    // ── Food ─────────────────────────────────────────────────────────────────
    // Weighted sums using DEFAULT_NUTRITIONAL_PROFILES values
    const dailyCalories = r(infants * 800  + children * 1500 + adults * 2000 + elderly * 1800);
    const dailyProtein  = r(infants *  11  + children *   35 + adults *   50 + elderly *   60);
    const dailyCarbs    = r(infants *  95  + children *  210 + adults *  275 + elderly *  230);
    const dailyFat      = r(infants *  30  + children *   55 + adults *   78 + elderly *   65);
    const dailyFiber    = r(                 children *   20 + adults *   28 + elderly *   21);
    const dailyWater    = Math.round((infants * 0.8 + children * 1.5 + adults * 2.5 + elderly * 2.0) * 10) / 10;

    // ── Healthcare ────────────────────────────────────────────────────────────
    const physicians             = Math.ceil(size / 1750);
    const dentalHygienists       = Math.ceil((size * 2) / 4000);
    const mentalHealthProviders  = Math.ceil(size * 0.20 / 50);
    const annualBirths           = r(size * 13 / 1000);
    const annualDeaths           = r(size *  9 / 1000);
    const annualPrimaryCareVisits = r(size * 3);

    // ── Labor ─────────────────────────────────────────────────────────────────
    const factor = size / 1000;
    const domains = LABOR_DOMAINS.map(d => ({
        name: d.name,
        ftes: { min: r(d.perK.min * factor), max: r(d.perK.max * factor) },
    }));

    const totalMin = domains.reduce((s, d) => s + d.ftes.min, 0);
    const totalMax = domains.reduce((s, d) => s + d.ftes.max, 0);

    return {
        demographics: {
            total: size,
            infants,
            children,
            adults,
            elderly,
            availableFTEs,
            dependencyRatio,
        },
        food: {
            daily: {
                calories: dailyCalories,
                proteinG: dailyProtein,
                carbsG:   dailyCarbs,
                fatG:     dailyFat,
                fiberG:   dailyFiber,
                waterL:   dailyWater,
            },
            annual: {
                calories: dailyCalories * 365,
                proteinG: r(dailyProtein * 365),
                carbsG:   r(dailyCarbs   * 365),
                fatG:     r(dailyFat     * 365),
                fiberG:   r(dailyFiber   * 365),
                waterL:   Math.round(dailyWater * 365 * 10) / 10,
            },
        },
        healthcare: {
            physicians,
            dentalHygienists,
            mentalHealthProviders,
            annualBirths,
            annualDeaths,
            annualPrimaryCareVisits,
        },
        labor: {
            availableFTEs,
            domains,
            totalRequired: { min: totalMin, max: totalMax },
            reserve: { min: availableFTEs - totalMax, max: availableFTEs - totalMin },
        },
    };
}
