import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * A Butchery handles the slaughter and processing of community livestock.
 *
 * Without a butchery, animals cannot become food safely at scale. Improper
 * slaughter and processing are serious public health risks — contamination,
 * spoilage, and disease transmission. This unit provides the sanitation
 * infrastructure and trained staff to do it correctly.
 *
 * This is episodic work rather than daily operations — slaughter happens in
 * batches tied to livestock cycles, seasonal availability, and community need.
 * Output flows to the Cannery (curing, smoking, preservation) and CommunityKitchen
 * (fresh preparation) as appropriate.
 *
 * A community without livestock does not need this unit. When livestock is
 * present — even small-scale chicken or goat operations — this unit becomes
 * essential for converting animals into food the community can actually consume.
 */
export class Butchery extends FunctionalUnit {
    constructor() {
        super("Butchery", "Handles the slaughter and processing of community livestock into food.");
    }
}
