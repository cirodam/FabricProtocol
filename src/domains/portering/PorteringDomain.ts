import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";

/**
 * The Portering domain handles the movement of goods and people within the community.
 *
 * In car-dependent communities, access to transportation is often the difference
 * between participation and isolation. When fuel is scarce or unaffordable, the
 * ability to move food, medicine, and supplies becomes a collective problem requiring
 * a collective solution. Portering makes that logistics labor visible, compensable,
 * and governed by the community rather than dependent on individual car ownership.
 *
 * This may include: delivery of food domain goods to members, transport of elderly
 * or disabled members to appointments, movement of goods between functional units,
 * and last-mile distribution of inter-community trade shipments.
 */
export class PorteringDomain extends FunctionalDomain {
    constructor() {
        super("Portering", "Handles the movement of goods and people within the community.");
    }
}
