import { FunctionalUnit } from "../commons/domain/FunctionalUnit.js";

/**
 * The Dental Clinic provides oral health care for community members.
 *
 * Dental care is routinely separated from "healthcare" in the US — a distinction that
 * has no clinical basis and exists primarily because dental care was excluded from
 * Medicare when it was created. The consequences are severe: untreated dental disease
 * causes chronic pain, malnutrition (people stop eating when it hurts), systemic
 * infection, and significant loss of productive capacity. It is among the most
 * prevalent unmet health needs in low-income communities.
 *
 * In a community economy, dental care is health care. The Dental Clinic is a fully
 * funded domain unit with dentists, hygienists, and assistants holding community
 * positions. Preventive care (cleanings, sealants, fluoride) dramatically reduces
 * the need for restorative work and should be the primary focus.
 *
 * At 30,000 members, with twice-yearly cleanings as the standard:
 * - 60,000 cleaning appointments per year
 * - ~4,000 cleanings per hygienist per year (half-hour appointments)
 * - ~15 hygienists for preventive load alone, plus dentists for restorative work
 *
 * Total staffing: ~30–40 FTEs
 */
export class DentalClinic extends FunctionalUnit {
    constructor() {
        super("Dental Clinic", "Provides preventive and restorative oral health care for community members.");
    }
}
