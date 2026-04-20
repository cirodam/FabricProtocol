import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * A water treatment facility takes raw water from a source — well, spring, river,
 * or rainwater collection — and renders it safe for drinking and household use.
 *
 * At community scale, treatment typically involves:
 *   - Sediment filtration (remove particulates)
 *   - Activated carbon filtration (remove organic compounds and chlorine)
 *   - UV sterilization (kill pathogens without chemical residue)
 *   - Optional: slow sand filtration for high-turbidity sources
 *
 * The facility should include a testing station for regular water quality checks.
 * Weekly testing for coliform bacteria is the minimum; broader panels quarterly.
 * Test results should be publicly posted — water quality is a community health matter,
 * not an administrative detail.
 *
 * Capacity is measured in liters per day. A community of 1,000 people needs
 * approximately 50,000–100,000 liters per day for drinking, cooking, and sanitation.
 * Agricultural irrigation requirements are orders of magnitude larger and handled
 * separately through the irrigation network.
 */
export class WaterTreatmentFacility extends FunctionalUnit {
    readonly capacityLitersPerDay: number;

    constructor(name: string, capacityLitersPerDay: number) {
        super(name, "Filters and sterilizes raw water for safe drinking and household use.");
        this.capacityLitersPerDay = capacityLitersPerDay;
    }

    getType(): string { return "water-treatment-facility"; }

}
