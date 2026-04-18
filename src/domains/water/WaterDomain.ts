import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";

/**
 * The Water domain manages the community's freshwater supply from source to tap:
 * extraction, treatment, storage, distribution, and irrigation.
 *
 * Water is the most foundational domain. Every other domain depends on it.
 * Food production fails without irrigation. Healthcare collapses without clean
 * water for sanitation and sterilization. Fire response requires pressurized
 * supply. Sanitation infrastructure processes wastewater that water infrastructure
 * first delivered. A community without secure water is not a community — it is
 * a temporary encampment.
 *
 * Climate change makes water security an active design problem rather than a
 * background assumption. Drought, aquifer depletion, contamination from extreme
 * weather events, and disrupted snowpack all threaten supplies that communities
 * currently take for granted. The Water domain exists to manage that risk
 * deliberately rather than discovering it during a crisis.
 *
 * This domain covers:
 *   - Source management: wells, springs, surface intakes, rainwater harvesting
 *   - Treatment: filtration, UV sterilization, chemical treatment where necessary
 *   - Storage: cisterns, towers, reservoirs — buffer capacity against supply disruption
 *   - Distribution: pipes, pumps, pressure management
 *   - Irrigation: agricultural water delivery coordinated with the Agriculture domain
 *   - Water quality monitoring: regular testing, contamination response
 *
 * Functional units within this domain might include:
 *   - A well or spring intake station
 *   - A water treatment facility
 *   - A storage reservoir or cistern
 *   - An irrigation network
 *   - A water quality testing station
 */
export class WaterDomain extends FunctionalDomain {
    constructor() {
        super("Water", "Manages freshwater extraction, treatment, storage, distribution, and irrigation for the community.");
    }
}
