import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

/**
 * The Agriculture domain organizes food production for the community.
 *
 * A community forming in rural America is not building agriculture from scratch. Rural
 * counties already have working farms, tractors, grain elevators, co-ops, and farmers
 * with decades of local soil knowledge. This domain is not an agrarian village being
 * constructed — it is an organizational layer that helps the community coordinate around
 * existing agricultural capacity.
 *
 * There is a distinction between Agriculture and Food worth preserving: Agriculture
 * is the upstream — growing, raising, harvesting. Food is the downstream — processing,
 * distributing, and ensuring every member is fed. They are separate functions with
 * separate budgets and separate governance, though tightly coupled. A well-funded food
 * domain backed by a weak agriculture domain is still a community dependent on outside
 * supply chains.
 *
 * The long-term goal of this domain is local caloric sovereignty: the community produces
 * enough of its own food that outside supply chains are a supplement, not a lifeline.
 */
export class AgricultureDomain extends FunctionalDomain {
    private static instance: AgricultureDomain;

    private constructor() {
        super("Agriculture", "Organizes food production, cultivation, and agricultural knowledge for the community.", "00000000-0000-0000-0000-000000000007");
        this.addRole(new CommunityRole(
            "Agriculture Coordinator",
            "Coordinates relationships with local farmers and producers, tracks seasonal growing plans, and connects agricultural output to the food domain.",
            700,
        ));
        this.addRole(new CommunityRole(
            "Agriculture Coordinator",
            "Coordinates relationships with local farmers and producers, tracks seasonal growing plans, and connects agricultural output to the food domain.",
            700,
        ));
    }

    static getInstance(): AgricultureDomain {
        if (!AgricultureDomain.instance) {
            AgricultureDomain.instance = new AgricultureDomain();
        }
        return AgricultureDomain.instance;
    }
}
