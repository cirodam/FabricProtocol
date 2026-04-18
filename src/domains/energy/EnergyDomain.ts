import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";

/**
 * The Energy domain manages the generation, storage, and distribution of energy
 * for the community.
 *
 * Energy is foundational infrastructure. Without it, every other domain degrades:
 * food storage fails, healthcare collapses, communications go dark, water pumps stop.
 * A community that depends entirely on grid power and fuel imports is one supply
 * disruption away from crisis.
 *
 * The goal of this domain is energy sovereignty: the capacity to generate enough
 * power locally to sustain essential community functions through disruptions of
 * arbitrary length. Grid connection may exist as a supplement or export channel,
 * but it is not a dependency.
 *
 * Energy sources at community scale:
 *   - Solar PV arrays with battery storage — lowest maintenance, modular
 *   - Small wind turbines — good complement to solar in appropriate geographies
 *   - Micro-hydro — highly reliable if a suitable watercourse exists
 *   - Wood gasification or biogas — dispatchable generation from organic waste
 *   - Grid connection — export surplus, import in deep deficit
 *
 * This domain also manages the community's energy consumption profile: which loads
 * are essential (cannot be shed), which are deferrable (can shift to peak generation
 * hours), and which are interruptible (shed first in a shortage). This load management
 * is as important as generation capacity for resilience.
 *
 * Functional units within this domain might include:
 *   - Solar array and battery bank
 *   - Wind turbine installation
 *   - Micro-hydro station
 *   - Biogas digester
 *   - Grid interconnect and metering station
 */
export class EnergyDomain extends FunctionalDomain {
    constructor() {
        super("Energy", "Manages community energy generation, storage, distribution, and load management.");
    }
}
