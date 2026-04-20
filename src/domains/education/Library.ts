import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * The Library is the community's knowledge commons.
 *
 * A library is not just a collection of books. In a community economy it is the
 * institutional memory of the community itself — holding records, technical references,
 * histories, and the accumulated knowledge that the community depends on to function.
 * When supply chains are disrupted and the internet is unreliable, a well-stocked
 * physical library becomes critical infrastructure.
 *
 * Priority holdings for a community library:
 * - Practical references: medicine, agriculture, construction, food preservation,
 *   sanitation, mechanics, electrical systems
 * - Community records: membership, governance decisions, asset registers, histories
 * - General education: curriculum materials for all age levels
 * - Cultural and literary works: the things that make a community worth living in
 *
 * The Library also serves as a quiet work space, a research facility, and a venue
 * for community education events. Its staff are not passive custodians — they are
 * active participants in knowledge transfer, helping members find what they need and
 * maintaining the systems that make knowledge accessible.
 */
export class Library extends FunctionalUnit {
    readonly createdAt: Date;

    constructor(name: string, description: string = "Maintains the community's knowledge commons, records, and reference collections.") {
        super(name, description);
        this.createdAt = new Date();
    }

    getType(): string { return "library"; }
}
