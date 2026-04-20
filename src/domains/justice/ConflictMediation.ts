import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * Conflict Mediation resolves disputes between community members before they escalate.
 *
 * Most conflicts don't need a tribunal. They need a trusted third party, a structured
 * conversation, and enough time. Two members in a dispute over shared resources, a
 * boundary, a perceived slight, an unmet obligation — these are normal features of
 * community life, not crimes. Handled early, they are resolved. Left to fester, they
 * split households, damage working relationships, and eventually destabilize the
 * community.
 *
 * Conflict Mediation is voluntary and confidential. A mediator is not a judge — they
 * have no authority to impose a decision. Their role is to help the parties understand
 * each other, identify what each actually needs, and reach an agreement they both
 * accept. An agreement reached this way is more durable than one imposed from outside.
 *
 * Mediators are community members with training in de-escalation and restorative
 * practice. They hold positions in this unit. They are not specialists in the sense
 * of being professionally distant — they are known, trusted, and embedded in the
 * community. This is a feature, not a problem.
 *
 * Conflict Mediation is the first resort. Cases that cannot be resolved here, or that
 * involve serious harm rather than dispute, escalate to the CommunityTribunal.
 */
export class ConflictMediation extends FunctionalUnit {
    constructor() {
        super("Conflict Mediation", "Resolves disputes between community members through voluntary, confidential mediation.");
    }

    getType(): string { return "conflict-mediation"; }

}
