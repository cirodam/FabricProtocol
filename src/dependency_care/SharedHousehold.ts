import { FunctionalUnit } from "../commons/domain/FunctionalUnit.js";

/**
 * A SharedHousehold is a small residential care home for members who can no longer
 * safely live alone but do not require continuous medical supervision.
 *
 * The evidence on institutional care is clear: large facilities with high resident-to-
 * staff ratios, rotating unfamiliar caregivers, and institutional environments produce
 * worse outcomes for cognitive decline, depression, and overall health than small
 * domestic settings with consistent staff who know the residents.
 *
 * A SharedHousehold houses 6–10 members in a residential building. Care staff rotate
 * but maintain continuity — the same small team, not a different face every shift.
 * The environment is domestic: a kitchen, shared living space, private or semi-private
 * rooms, a garden where possible. It is not a ward.
 *
 * Appropriate for members who:
 * - Can no longer safely manage daily tasks alone (cooking, medication, mobility)
 * - Do not have family members available or able to provide home care
 * - Do not have complex medical needs requiring clinical supervision
 * - Would benefit from social environment and peer community
 *
 * Each SharedHousehold is a separate unit instance. A community of 30,000 with ~5,400
 * elderly members may operate 30–50 shared households at varying levels of support,
 * serving several hundred residents in total.
 *
 * Staffing per household: 3–5 FTEs (day, evening, and overnight coverage)
 */
export class SharedHousehold extends FunctionalUnit {
    constructor(name: string) {
        super(name, "A small residential care home providing supported living for dependent community members.");
    }
}
