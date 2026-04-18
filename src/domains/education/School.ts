import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * The School provides formal instruction for children in the community.
 *
 * What a School can offer depends heavily on the community's current capacity. Under
 * stable conditions it may run a full K-12 program. Under stress — economic collapse,
 * infrastructure failure, staffing shortfalls — it may begin as primary education only,
 * or use multi-age groupings rather than grade levels, or rely on one teacher covering
 * a broad age range. The unit should be understood as a floor that expands as the
 * community stabilizes, not an assumed fully-resourced institution.
 *
 * Teachers are community members holding positions in this unit and compensated through
 * the payroll system. School buildings are assets on this unit's ledger. The number
 * of buildings and classrooms scales with community size and the age distribution of
 * the membership.
 *
 * For a community of 30,000 (~5,100 school-age children at US demographic ratios):
 * - ~200 classrooms at 25 students each
 * - Roughly 7–13 school buildings depending on building size
 * - Staffing: ~200 teaching positions plus administration and support
 *
 * Smaller communities should not attempt to replicate this structure — a community
 * of 500 may have one building, one classroom per age band, and teachers who also
 * hold positions in other domains.
 */
export class School extends FunctionalUnit {
    constructor() {
        super("School", "Provides formal instruction for children, scaled to community capacity.");
    }
}
