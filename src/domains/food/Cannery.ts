import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * A Cannery handles food preservation — converting harvest surplus into
 * shelf-stable stored food that extends the community's coverage days.
 *
 * This is batch work tied to agricultural cycles rather than daily service:
 * canning the summer tomato harvest, fermenting cabbage into sauerkraut,
 * drying beans and herbs, smoking and curing meat, making preserves. The
 * output flows into the food domain's stockpile, directly increasing the
 * number of days the community can feed itself without new production.
 *
 * The Cannery is also the primary site of food preservation knowledge —
 * the techniques that keep a community fed through winter are learned and
 * practiced here. This work is as much educational infrastructure as it is
 * food infrastructure.
 */
export class Cannery extends FunctionalUnit {
    constructor() {
        super("Cannery", "Preserves harvest surplus through canning, fermentation, drying, and curing.");
    }

    getType(): string { return "cannery"; }

}
