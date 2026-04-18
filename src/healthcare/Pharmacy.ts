import { FunctionalUnit } from "../commons/domain/FunctionalUnit.js";

/**
 * The Pharmacy dispenses medications and manages the community's medical stockpile.
 *
 * Dispensing is the visible function. Stockpile management is the strategic one.
 *
 * The community cannot manufacture pharmaceuticals. Antibiotics, insulin, cardiac
 * medications, seizure drugs, psychiatric medications — these come from outside supply
 * chains that can be disrupted. A community that maintains only a few days of supply
 * is one disruption away from preventable deaths. A community that maintains 6–12
 * months of essential medications for its chronically ill members has meaningful
 * resilience.
 *
 * The Pharmacy's stockpile function mirrors the FoodStorage unit: it maintains a
 * formulary of essential medications, tracks inventory and expiration, rotates stock,
 * and flags shortfalls before they become crises. The pharmacists who manage this are
 * doing infrastructure work, not just counting pills.
 *
 * The Pharmacy also plays a coordination role: monitoring for drug interactions across
 * members on complex regimens, managing controlled substance protocols, and working
 * with the Clinic to optimize prescribing for the medications that are actually
 * available and affordable to stockpile.
 *
 * Total staffing: ~15–20 FTEs (pharmacists, pharmacy technicians)
 */
export class Pharmacy extends FunctionalUnit {
    constructor() {
        super("Pharmacy", "Dispenses medications and manages the community's essential medicine stockpile.");
    }
}
