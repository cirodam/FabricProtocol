import { FunctionalDomain } from "../commons/domain/FunctionalDomain.js";

/**
 * The Agriculture domain organizes food production for the community.
 *
 * There is a distinction between Agriculture and Food worth preserving: Agriculture
 * is the upstream — growing, raising, harvesting, and preserving. Food is the
 * downstream — distributing, vouching, and ensuring every member is fed. They are
 * separate functions with separate budgets and separate governance, though they are
 * tightly coupled. A well-funded food domain backed by a weak agriculture domain is
 * still a community dependent on outside supply chains.
 *
 * This domain covers: crop planning and cultivation, animal husbandry, soil management,
 * seed saving, harvest, and preservation. It is also the steward of the community's
 * agricultural knowledge — the skills that have to be taught, practiced, and passed on
 * if the community is going to feed itself rather than just redistribute purchased food.
 *
 * The long-term goal of this domain is local caloric sovereignty: the community produces
 * enough of its own food that outside supply chains are a supplement, not a lifeline.
 */
export class AgricultureDomain extends FunctionalDomain {
    constructor() {
        super("Agriculture", "Organizes food production, cultivation, and agricultural knowledge for the community.");
    }
}
