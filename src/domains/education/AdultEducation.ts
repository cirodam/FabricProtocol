import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * Adult Education serves members whose foundational learning needs weren't met before
 * joining the community.
 *
 * This is not remediation in a pejorative sense. The US educational system has left
 * significant portions of the population without reliable literacy, numeracy, or the
 * skills to navigate an increasingly complex world. A community that accepts members
 * unconditionally accepts this reality and has to build for it.
 *
 * Adult Education covers:
 * - Literacy and numeracy for members who need it
 * - English language instruction for members whose first language is not English
 * - GED and credential support for members who left school early
 * - Re-skilling for members transitioning out of roles that no longer exist
 * - General interest learning — the things people pursue for their own enrichment
 *
 * The last item is not a luxury. A community that only teaches people what it needs
 * from them is extractive. People should be able to learn things because they want to.
 *
 * Adult Education works closely with the Library (resources) and VocationalTraining
 * (pathway into skilled roles) but serves a distinct population and purpose.
 */
export class AdultEducation extends FunctionalUnit {
    constructor() {
        super("Adult Education", "Provides foundational and continuing education for adult community members.");
    }

    getType(): string { return "adult-education"; }

}
