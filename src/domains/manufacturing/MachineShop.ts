import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * A machine shop is the core fabrication unit of the Manufacturing domain.
 *
 * At a minimum: a metal lathe, a milling machine, a drill press, an angle grinder,
 * and basic hand tools. With this kit a skilled machinist can fabricate or repair
 * most of the mechanical components the community depends on.
 *
 * Priority capabilities:
 * - Replacement parts for agricultural equipment (bearings, shafts, gears)
 * - Water system components (pump parts, fittings, valve bodies)
 * - Structural hardware (brackets, bolts, clamps)
 * - Energy system hardware (mounting structures, turbine components)
 *
 * The shop is also a training space. Apprentices work alongside skilled machinists,
 * maintaining the institutional knowledge that keeps the shop functional across
 * generations of community membership.
 */
export class MachineShop extends FunctionalUnit {
    constructor(name: string = "Machine Shop") {
        super(name, "Metal fabrication and machining. Produces and repairs mechanical components for community infrastructure.");
    }
}
