import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * A micro-hydro station generates continuous, dispatchable power from a
 * watercourse with sufficient head and flow.
 *
 * Unlike solar or wind, micro-hydro runs 24 hours a day regardless of weather.
 * A well-sited run-of-river installation requires minimal storage because the
 * generation is continuous and predictable. For communities with a suitable
 * stream or river, micro-hydro is often the most reliable and lowest-maintenance
 * generation source available.
 *
 * Requires: sufficient head (vertical drop) and flow rate. Site assessment is
 * the critical first step — not every watercourse is suitable.
 */
export class MicroHydroStation extends FunctionalUnit {
    readonly capacityKw: number;

    constructor(name: string, capacityKw: number) {
        super(name, "Run-of-river micro-hydro generation. Continuous, dispatchable, low-maintenance.");
        this.capacityKw = capacityKw;
    }

    getType(): string { return "micro-hydro-station"; }

}
