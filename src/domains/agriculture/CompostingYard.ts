import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * A CompostingYard closes the nutrient loop between food waste and agricultural soil.
 *
 * Every community that processes food produces organic waste: kitchen scraps, crop
 * residue, food spoilage, animal manure, wood ash, and spent bedding. Without a
 * composting operation, these waste streams are disposed of — and the community
 * continuously depletes its soil fertility while purchasing synthetic replacements.
 *
 * The CompostingYard is where those streams reconverge. It accepts inputs from:
 * - The Sanitation domain (organic waste collection)
 * - The Food domain (kitchen and cannery waste, spoilage)
 * - FarmOperations (crop residue, manure)
 *
 * Its output — finished compost — returns to FarmOperations and the Greenhouse as
 * the primary soil amendment. This loop is the long-term foundation of the community's
 * soil health. Farms that receive external fertility inputs (purchased fertilizer)
 * are one supply chain disruption away from soil that cannot support a crop.
 *
 * The CompostingYard is also one of the few operations that genuinely scales down
 * gracefully — it can start small and expand as the community grows.
 */
export class CompostingYard extends FunctionalUnit {
    constructor() {
        super("Composting Yard", "Closes the nutrient loop by converting organic waste into soil amendments for farm operations.");
    }

    getType(): string { return "composting-yard"; }

}
