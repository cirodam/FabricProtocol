import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";

/**
 * The Ecology domain stewards the health of the land, water, and living systems
 * the community depends on.
 *
 * Every other domain extracts from the natural world: the Food domain takes from
 * the soil, the Water domain draws from the aquifer, Energy takes from sun and wind,
 * Housing takes from forests. The Ecology domain is the counterweight — it monitors
 * what is being taken, tracks whether natural systems are recovering or degrading,
 * and advises the assembly when extraction is outpacing regeneration.
 *
 * Like the Audit domain, this domain has no spending authority over other domains.
 * Its outputs are information and recommendations. The assembly acts on them or doesn't.
 * But the data it produces — soil health trends, water table levels, species diversity,
 * forest cover, watershed condition — is the early warning system for the community's
 * long-term survival. A community that ignores its ecology domain is spending down
 * a natural capital balance it cannot replenish on any human timescale.
 *
 * Typical work:
 *   - Soil health monitoring across agricultural land (organic matter, compaction, pH)
 *   - Water quality and quantity tracking (aquifer levels, runoff, contamination)
 *   - Biodiversity assessment (indicator species, pollinator health, forest understory)
 *   - Carbon and nutrient cycling — is the community building or depleting soil carbon?
 *   - Impact assessment for proposed land use changes before the assembly votes
 *   - Coordination with the Food domain on regenerative practices and crop rotation
 *   - Coordination with the Water domain on watershed protection
 *   - Coordination with the Energy domain on land use for solar/wind vs. food production
 *
 * Two to four people at mature community scale. Should include someone with formal
 * ecology or soil science training if possible.
 */
export class EcologyDomain extends FunctionalDomain {
    constructor() {
        super("Ecology", "Monitors and stewards the health of land, water, and living systems the community depends on.");
    }
}
