import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

// A community theater, hall, or outdoor stage — the primary venue for performances,
// assemblies, screenings, and large gatherings.
export class PerformanceVenue extends FunctionalUnit {
    readonly capacitySeated: number;

    constructor(name: string, capacitySeated: number) {
        super(name, "Community performance and assembly venue.");
        this.capacitySeated = capacitySeated;
    }

    getType(): string { return "performance-venue"; }

}
