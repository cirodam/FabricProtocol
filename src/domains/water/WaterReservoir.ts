import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * A water storage reservoir, cistern, or elevated tank providing buffer capacity
 * between supply and demand.
 *
 * Storage is what makes the water system resilient. Without it, any interruption
 * to the source or treatment facility immediately affects the community. With
 * adequate storage — typically 2–7 days of community consumption — the system
 * can absorb pump failures, treatment shutdowns, source disruptions, and
 * firefighting demand without affecting daily supply.
 *
 * Elevated tanks also provide distribution pressure without pumping energy,
 * which matters in an off-grid or energy-constrained community.
 *
 * Capacity is measured in liters.
 */
export class WaterReservoir extends FunctionalUnit {
    readonly capacityLiters: number;

    constructor(name: string, capacityLiters: number) {
        super(name, "Water storage providing buffer capacity between supply and distribution.");
        this.capacityLiters = capacityLiters;
    }

    getType(): string { return "water-reservoir"; }

}
