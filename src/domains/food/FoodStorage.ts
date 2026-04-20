import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * The FoodStore manages the community's food storage infrastructure and inventory.
 *
 * Storage buildings (grain stores, root cellars, cold rooms) are assets on the
 * food domain's ledger. The FoodStore is the operation that runs them: receiving
 * incoming goods, maintaining rotation discipline (first in, first out), monitoring
 * storage conditions, managing pest control, and keeping the inventory current.
 *
 * Accurate inventory is what makes the food domain's supply ledger meaningful.
 * Without it, coverage day calculations are guesses. The FoodStore's primary
 * output is reliable data — what the community has, where it is, and how long
 * it will last.
 *
 * This unit also coordinates with the Portering domain for movement of goods
 * between storage locations, production units, and distribution points.
 */
export class FoodStorage extends FunctionalUnit {
    constructor() {
        super("Food Storage", "Manages community food storage infrastructure, inventory, and rotation.");
    }

    getType(): string { return "food-storage"; }

}
