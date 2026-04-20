import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * The FarmCoordinator is the Agriculture domain's interface with private farms.
 *
 * Farms in the community economy are typically privately owned — farmers own their
 * land and equipment, make their own production decisions, and are not on community
 * payroll. The community's food security depends on them, but it does not require
 * owning what they own.
 *
 * The FarmCoordinator's job is to make sure food is actually being grown:
 * - Maintain a registry of farms participating in the community economy
 * - Assess the productive health of each farm (acreage, crop mix, soil condition,
 *   equipment status, operator capacity)
 * - Identify gaps — crops the community needs that nobody is growing
 * - Coordinate with the FoodDomain on projected supply and shortfalls
 * - Connect farmers with shared infrastructure (Greenhouse seedlings, SeedLibrary
 *   seed stock, CompostingYard amendments)
 * - Flag situations where a farm is at risk (illness, equipment failure, operator
 *   leaving the community) and help arrange coverage
 *
 * The FarmCoordinator does not direct farmers. It provides visibility and coordination
 * so that private production decisions, in aggregate, meet community needs.
 */
export class FarmCoordinator extends FunctionalUnit {
    constructor() {
        super("Farm Coordinator", "Coordinates with private farms to ensure community food needs are met.");
    }

    getType(): string { return "farm-coordinator"; }

}
