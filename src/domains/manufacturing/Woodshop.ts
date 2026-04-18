import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * A woodshop handles all structural and finish carpentry for the community.
 *
 * In a community with access to timber — whether harvested locally or traded —
 * the woodshop produces: furniture, cabinetry, structural framing components,
 * tool handles, storage vessels, and specialty items the community needs.
 *
 * The woodshop supports both the Housing domain (construction and repair) and
 * the broader community (furniture, equipment). In a disruption scenario, the
 * ability to work wood becomes a core survival skill rather than a craft hobby.
 */
export class Woodshop extends FunctionalUnit {
    constructor(name: string = "Woodshop") {
        super(name, "Carpentry and woodworking. Produces structural and finish wood goods for the community.");
    }
}
