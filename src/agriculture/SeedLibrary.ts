import { FunctionalUnit } from "../commons/domain/FunctionalUnit.js";

/**
 * A SeedLibrary maintains the community's seed supply and genetic diversity.
 *
 * Seed sovereignty is a prerequisite for food sovereignty. A community that purchases
 * seeds from outside every year has a supply chain dependency at the very foundation
 * of its food system. Hybrid and GMO seeds often cannot be saved at all; even open-
 * pollinated seeds require active management to remain viable and adapted to local
 * conditions.
 *
 * The SeedLibrary is not a storage room — it is an active operation. Seeds must be
 * grown out regularly (every 3–5 years depending on species) to test viability and
 * refresh stock. Isolation distances must be managed to prevent cross-pollination.
 * Selection pressure over generations adapts varieties to local soil and climate.
 *
 * The SeedLibrary also serves as an institutional knowledge anchor. The people who
 * run it carry understanding of which varieties perform in this specific place, which
 * cannot be looked up.
 *
 * It operates in close coordination with the Greenhouse (for grow-outs) and all
 * FarmOperations (as the source of planting stock each season).
 */
export class SeedLibrary extends FunctionalUnit {
    constructor() {
        super("Seed Library", "Maintains community seed supply, genetic diversity, and seed sovereignty.");
    }
}
