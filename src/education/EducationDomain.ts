import { FunctionalDomain } from "../commons/domain/FunctionalDomain.js";

/**
 * The Education domain organizes learning and knowledge transfer within the community.
 *
 * Formal schooling is only one part of what this domain covers. In a community economy,
 * education includes vocational training, apprenticeships, literacy support, language
 * instruction for new members, and the transmission of practical skills — farming,
 * construction, food preservation, medical care — that the community depends on.
 *
 * Making education a funded domain means teachers and mentors hold positions and are
 * compensated for their labor. Knowledge transfer is not a volunteer activity or a
 * market transaction — it is community infrastructure, as essential as housing or food.
 */
export class EducationDomain extends FunctionalDomain {
    constructor() {
        super("Education", "Organizes learning, skill transfer, and knowledge infrastructure for the community.");
    }
}
