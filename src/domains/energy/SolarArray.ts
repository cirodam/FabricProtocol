import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * A solar array paired with battery storage is the primary generation source
 * for most community-scale energy systems.
 *
 * Solar PV is modular, low-maintenance, and manufacturable at community scale.
 * Battery storage (LFP chemistry preferred for longevity and safety) bridges
 * the gap between generation peaks and consumption peaks. A properly sized
 * system with 2–4 days of storage capacity can carry the community through
 * most weather events without shedding essential loads.
 *
 * The array also functions as a manufacturing target — as the community's
 * machine shop and fabrication capacity grows, more components of the energy
 * system can be produced locally rather than imported.
 */
export class SolarArray extends FunctionalUnit {
    readonly capacityKw: number;
    readonly storageKwh: number;

    constructor(name: string, capacityKw: number, storageKwh: number) {
        super(name, "Solar PV generation with battery storage.");
        this.capacityKw = capacityKw;
        this.storageKwh = storageKwh;
    }
}
