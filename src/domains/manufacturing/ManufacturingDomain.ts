import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";

/**
 * The Manufacturing domain gives the community the capacity to fabricate, repair,
 * and produce physical goods rather than depending entirely on external supply chains.
 *
 * A community that can only consume manufactured goods but cannot produce them is
 * permanently fragile. A machine shop changes that calculus: the community can
 * fabricate replacement parts, repair equipment, build tools, and produce trade goods
 * for the federation. When supply chains are disrupted — as they increasingly will be —
 * manufacturing capacity is the difference between adaptation and slow collapse.
 *
 * This domain does not aim to replicate industrial-scale production. Its goal is
 * sufficiency: the ability to maintain existing infrastructure, produce basic goods,
 * and repair rather than replace. That requires skilled machinists, welders, and
 * fabricators — people whose training is sustained by the Education domain through
 * apprenticeships and vocational programs.
 *
 * Functional units within this domain might include:
 *   - Machine shop (lathe, mill, drill press, CNC if available)
 *   - Welding and metal fabrication shop
 *   - Woodshop and carpentry
 *   - Forge / blacksmithing
 *   - Textile production (if fiber crops are grown)
 *   - Electronics repair and light fabrication
 */
export class ManufacturingDomain extends FunctionalDomain {
    constructor() {
        super("Manufacturing", "Provides fabrication, repair, and production capacity to reduce dependency on external supply chains.");
    }
}
