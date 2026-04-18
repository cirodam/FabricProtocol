import { FunctionalUnit } from "../commons/domain/FunctionalUnit.js";

/**
 * A Greenhouse extends the growing season and produces seedlings for field operations.
 *
 * In most of the US, open-field growing is constrained to 4–7 months of the year.
 * A heated greenhouse makes it possible to start seedlings 6–8 weeks before last frost,
 * dramatically increasing yield from the same acreage. It also enables year-round
 * production of greens, herbs, and other high-nutrition crops that are otherwise absent
 * from the community's winter diet.
 *
 * Unlike a FarmOperation, a greenhouse is purpose-built community infrastructure rather
 * than inherited from existing farms. It is likely to be the first significant capital
 * project the Agriculture domain undertakes.
 *
 * Primary functions:
 * - Seedling propagation for all field operations
 * - Winter and shoulder-season fresh produce
 * - Experimental and heirloom variety cultivation
 * - Crop trials for new varieties before committing field acreage
 */
export class Greenhouse extends FunctionalUnit {
    constructor() {
        super("Greenhouse", "Extends the growing season and produces seedlings for community field operations.");
    }
}
