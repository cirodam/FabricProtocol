import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * The Community Tribunal makes binding decisions on serious harms when no external
 * legal authority is available.
 *
 * This is the last resort, not the first. It convenes when a harm is serious enough
 * to require a community decision — violence against a person, significant theft or
 * destruction of community property, repeated conduct that threatens community safety
 * after mediation has failed. It does not handle disputes that belong in ConflictMediation.
 *
 * The Tribunal is not a court in the professional sense. It is a structured community
 * process with three elements:
 *
 * 1. **Fact-finding** — what happened, as clearly as can be established. Both the
 *    person who caused harm and the person who was harmed speak. Witnesses speak.
 *    The community listens before it decides.
 *
 * 2. **Accountability** — the person who caused harm is asked to acknowledge it.
 *    Not as a ritual humiliation but as a necessary precondition for repair. A
 *    community cannot move forward pretending harm did not occur.
 *
 * 3. **Repair and consequence** — what does the harmed person need? What does the
 *    community need? What is the path back to membership in good standing? Consequences
 *    are proportionate and oriented toward repair: restitution, community service,
 *    supervised reintegration. In the most serious cases — violence that cannot be
 *    safely tolerated — removal from the community is a last resort, not a default.
 *
 * The Tribunal is composed of community members selected through the governance
 * system, not permanent officers. No one should hold standing judicial authority
 * over their neighbors indefinitely. The constable function — executing Tribunal
 * decisions — is a position within this unit, held by a member with the community's
 * trust and a narrow, explicit mandate.
 *
 * The Tribunal's legitimacy rests entirely on community trust. A community that does
 * not trust this process will route around it — through private retaliation, through
 * factions, through the informal authority of whoever is most feared. Building and
 * maintaining that trust is as important as the process itself.
 */
export class CommunityTribunal extends FunctionalUnit {
    constructor() {
        super("Community Tribunal", "Makes binding decisions on serious harms through a restorative community process.");
    }
}
