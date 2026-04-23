import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * A CommunityKitchen produces cooked meals for institutional and communal distribution.
 *
 * This is daily operational work: feeding elderly members who cannot cook for
 * themselves, supplying the childcare and healthcare domains with prepared meals,
 * and providing communal dining for members who need it. It is the food domain's
 * service delivery layer — turning stored and fresh food into meals that reach
 * people directly.
 *
 * Food preservation (canning, fermentation, drying) is handled separately by
 * the Cannery, which operates on harvest-cycle rhythms rather than daily service.
 */
export class CommunityKitchen extends FunctionalUnit {
    readonly createdAt: Date;

    constructor(name: string, description: string = "Prepares and delivers meals for members who cannot cook for themselves, and for community institutions.", id?: string) {
        super(name, description, undefined, id);
        this.createdAt = new Date();
    }

    getType(): string { return "community-kitchen"; }
}
