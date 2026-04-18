import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";

/**
 * The Education domain organizes learning and knowledge transfer within the community.
 *
 * The goal is not to prepare children for employment — the community's three-layer
 * income model (food voucher floor, commons dividend, wages for work) means survival
 * is not contingent on holding a job. The goal is to produce capable, engaged members
 * who can participate in governance, contribute when the community needs them, and
 * live well.
 *
 * Education is organized in three phases:
 *
 *   Foundational (ages 5–12): Structured instruction in literacy, numeracy, and
 *   basic science. Taught by paid community members in small groups.
 *
 *   Applied (ages 12–16): Apprenticeships within functional domains. The student
 *   contributes real labor at reduced capacity while learning domain skills from
 *   working members.
 *
 *   Self-directed (16+): Philosophy, science, advanced skills, or deeper domain
 *   specialization — whatever the member chooses to pursue. The community provides
 *   access to knowledge and knowledgeable members; direction is the member's own.
 *
 * Teachers and mentors hold funded positions and are compensated as community workers.
 * Knowledge transfer is community infrastructure, not a volunteer activity.
 */
export class EducationDomain extends FunctionalDomain {
    constructor() {
        super("Education", "Organizes learning, skill transfer, and knowledge infrastructure for the community.");
    }
}
