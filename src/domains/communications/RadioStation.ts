import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

// A community radio station. Provides broadcast infrastructure for the community
// and, via federation agreements, inter-community communication.
// In practice: a low-power FM transmitter, a receiver shack, and volunteer operators.
export class RadioStation extends FunctionalUnit {
    readonly frequencyMHz: number | null; // null if not yet licensed/assigned

    constructor(name: string, frequencyMHz: number | null = null) {
        super(name, "Community radio station providing broadcast and emergency communications.");
        this.frequencyMHz = frequencyMHz;
    }
}
