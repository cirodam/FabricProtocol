import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";

/**
 * The Justice domain provides conflict resolution and accountability for communities
 * operating in the absence of a functioning external legal system.
 *
 * This domain is not intended to operate in parallel with existing law enforcement
 * and courts. Where those institutions are functioning, the community defers to them.
 * Running a parallel justice system while the county sheriff and district court are
 * operational invites conflict the community does not need.
 *
 * This domain becomes relevant when those institutions have failed, withdrawn, or
 * become inaccessible — a sharply degraded environment where the community must
 * provide its own accountability structure or have none at all. In the absence of
 * any structure, the most aggressive people fill the vacuum. That is not acceptable.
 *
 * The domain's philosophy is restorative rather than punitive. The question is not
 * "what punishment does this person deserve?" but "what harm was done, how is it
 * repaired, and what does the community need to prevent it from happening again?"
 * Punishment as an end in itself produces resentment and does not make the community
 * safer. Repair, accountability, and reintegration do.
 *
 * Community rules — the laws this domain enforces — are established through the normal
 * governance process (Proposals, Constitution) and represent the community's collective
 * decisions about conduct. They are minimal by design: harm to persons, harm to
 * community property, and conduct that threatens the community's ability to function.
 * The community does not legislate private life.
 *
 * The domain's two functional units are ConflictMediation (pre-emptive, voluntary,
 * handles disputes before they become serious) and CommunityTribunal (formal,
 * binding, for serious harms that require a community decision).
 */
export class JusticeDomain extends FunctionalDomain {
    constructor() {
        super("Justice", "Provides conflict resolution and accountability in the absence of a functioning external legal system.");
    }
}
