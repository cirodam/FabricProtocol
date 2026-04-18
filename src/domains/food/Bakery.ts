import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * A Bakery is a community-owned bread and grain production facility.
 *
 * The Bakery is the direct downstream of the Mill — it takes flour and produces
 * bread, staple baked goods, and other grain-based foods at scale. At community
 * scale, a bakery is not a retail shop. It is provisioning infrastructure: producing
 * the daily bread that the food domain distributes to members.
 *
 * Private enterprise bakeries can and should coexist with this unit. The community
 * bakery handles the baseline — bulk production, institutional supply, and provisioning
 * for members who cannot access the market. Private bakers handle variety, specialty
 * goods, and everything above the floor.
 */
export class Bakery extends FunctionalUnit {
    constructor() {
        super("Bakery", "Produces bread and grain-based staples for community distribution.");
    }
}
