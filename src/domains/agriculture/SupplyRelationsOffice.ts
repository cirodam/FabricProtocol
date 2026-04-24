import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

/**
 * The Supply Relations Office manages the community's external food supply relationships.
 *
 * No community grows everything it needs. Grains, legumes, cooking oils, salt, sugar,
 * spices, and specialty items will always require external sourcing for most communities —
 * especially during the years before local food production reaches meaningful scale.
 *
 * The Supply Relations Office makes that sourcing deliberate rather than accidental.
 * Its job is to know where the community's food comes from, to build direct relationships
 * with producers and other communities, and to negotiate supply agreements that favor
 * reliability and fair dealing over lowest price.
 *
 * This office operates at two levels:
 *
 * External suppliers — regional farms, co-ops, processors, and distributors outside
 * the community network. The office vets these relationships, negotiates terms, and
 * monitors supply reliability. It prefers regional over national, direct over
 * intermediated, and relationship-based over spot-market purchasing.
 *
 * Inter-community trade — as the federation network grows, the Supply Relations Office
 * becomes the community's trade desk for food supply agreements with other communities.
 * A community that grows surplus wheat trades with one that grows surplus beans. These
 * agreements are negotiated at the domain level, cleared through the federation, and
 * benefit both sides more than either would gain from open-market purchasing.
 *
 * The Supply Relations Office also maintains the community's staple crop map — a living
 * picture of what is grown locally, what is sourced externally, and what would fail if
 * a given supply chain broke. That visibility is the precondition for reducing
 * dependency over time.
 */
export class SupplyRelationsOffice extends FunctionalUnit {
    constructor(name: string = "Supply Relations Office", id?: string) {
        super(
            name,
            "Manages external food supply relationships, inter-community trade agreements, and the community's staple crop map.",
            "supply-relations-office",
            id,
        );
        this.addRole(new CommunityRole(
            "Supply Relations Coordinator",
            "Leads external supplier relationships, negotiates supply agreements, and maintains the staple crop map.",
            600,
        ));
        this.addRole(new CommunityRole(
            "External Liaison",
            "Manages ongoing relationships with specific supplier accounts and other community trade desks.",
            450,
        ));
    }

    getType(): string { return "supply-relations-office"; }
}
