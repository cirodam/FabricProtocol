import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * A GrainElevator is a community-owned bulk grain storage facility.
 *
 * Grain elevators store whole grain berries (wheat, corn, oats, rye) at scale
 * for long-term food security. They are the physical backbone of the community's
 * emergency food stockpile — the difference between a community that can weather
 * supply chain disruptions and one that cannot.
 *
 * Whole grain berries stored in sealed, cool, dry conditions last 25–30 years,
 * making them the most shelf-stable calorie source available. The grain elevator
 * manages intake from the Agriculture domain, rotation protocols, and release
 * to the Mill for processing and to the Community Kitchen for emergency use.
 */
export class GrainElevator extends FunctionalUnit {
    readonly createdAt: Date;

    constructor(name: string = "Grain Elevator", description: string = "Stores bulk grain for long-term community food security and emergency stockpile management.", id?: string) {
        super(name, description, "grain-elevator", id);
        this.createdAt = new Date();
    }

    getType(): string { return "grain-elevator"; }
}
