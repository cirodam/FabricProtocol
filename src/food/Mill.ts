import { FunctionalUnit } from "../commons/domain/FunctionalUnit.js";

/**
 * A Mill is a community-owned grain processing facility.
 *
 * Whole grain berries (wheat, corn, oats) are the most shelf-stable form of stored
 * calories — lasting 25-30 years sealed. But they require milling before they can
 * be cooked. The mill is the infrastructure that makes the long-term grain stockpile
 * usable. Without it, the community's most durable food reserves are inaccessible.
 *
 * A mill at community scale is an operation, not an appliance. It requires dedicated
 * space (flour dust is a fire hazard), trained operators, and regular maintenance.
 * It should be staffed with positions and funded by the Food domain.
 *
 * At minimum, a community should have:
 * - One electric or mechanized mill for daily throughput
 * - One manual (hand-cranked) mill as a grid-independent backup
 */
export class Mill extends FunctionalUnit {
    constructor() {
        super("Mill", "Processes whole grain into flour and meal for community consumption.");
    }
}
