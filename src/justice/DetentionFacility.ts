import { FunctionalUnit } from "../commons/domain/FunctionalUnit.js";

/**
 * The Detention Facility provides secure holding for community members who pose an
 * immediate danger and cannot be safely managed by any other means.
 *
 * This unit exists because communities will occasionally face situations that require
 * it. That is not a reason to build it enthusiastically. A community that reaches for
 * detention readily has already failed at something upstream — in care, in conflict
 * resolution, in early intervention. The existence of this unit should be understood
 * as a last resort, not a routine tool.
 *
 * Three situations justify detention:
 *
 * 1. **Acute crisis hold** — a person who is acutely dangerous due to mental health
 *    crisis, intoxication, or acute trauma. Measured in hours. The goal is de-escalation
 *    and stabilization, not punishment. MentalHealthServices leads; this unit provides
 *    a safe space to do that work.
 *
 * 2. **Pre-tribunal hold** — a person who has caused serious harm and is a credible
 *    flight or safety risk before the Tribunal convenes. Measured in days. Authorized
 *    by the Tribunal with a defined review date.
 *
 * 3. **Post-tribunal detention** — a person the Tribunal has found dangerous and for
 *    whom no other option (reintegration, expulsion) is safe or available. This is
 *    the hardest case. It requires ongoing Tribunal authorization on a defined review
 *    cycle — detention does not continue by default. The community bears the cost of
 *    this decision in labor, resources, and moral weight, and that cost should create
 *    pressure toward resolution.
 *
 * Physical requirements are modest: a secure room with a window, ventilation, a bed,
 * and a toilet. The environment should be humane. A person held here has not yet been
 * found responsible by the Tribunal, or is being held because the community cannot
 * manage them otherwise — not because suffering is the goal.
 *
 * Custodians are community members holding positions in this unit. Their role is not
 * punitive — they provide meals, facilitate communication with family members, and
 * coordinate with MentalHealthServices. The Norwegian framing applies: conditions of
 * detention should support eventual return to community life wherever possible, not
 * make it less likely.
 *
 * A detention facility that is never used is a success, not a waste.
 */
export class DetentionFacility extends FunctionalUnit {
    constructor() {
        super("Detention Facility", "Provides secure holding for community members who pose an immediate danger and cannot be managed by other means.");
    }
}
