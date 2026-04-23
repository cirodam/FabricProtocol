import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

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
 */
export class WaterDomain extends FunctionalDomain {
    private static instance: WaterDomain;

    constructor() {
        super("Water", "Manages freshwater extraction, treatment, storage, distribution, and irrigation for the community.");
        this.addRole(new CommunityRole(
            "Water Coordinator",
            "Oversees water source management, treatment, storage, distribution infrastructure, irrigation coordination, and water quality monitoring.",
            700,
        ));
    }

    static getInstance(): WaterDomain {
        if (!WaterDomain.instance) {
            WaterDomain.instance = new WaterDomain();
        }
        return WaterDomain.instance;
    }
}
