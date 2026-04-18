import { FunctionalUnit } from "../commons/domain/FunctionalUnit.js";

/**
 * The Birthing Center provides obstetric and maternal care for the community.
 *
 * A community of 30,000 produces approximately 350–400 births per year — enough
 * volume to justify dedicated midwives, a purpose-equipped facility, and a team
 * with genuine expertise in normal births, complications, and postpartum care.
 *
 * The Birthing Center operates on a midwifery-led model for the majority of births,
 * with physician backup available through the Emergency Department for complications.
 * This reflects the evidence: for low-risk pregnancies, midwifery-led care produces
 * outcomes equal to or better than physician-led care, with lower rates of unnecessary
 * intervention.
 *
 * Services include:
 * - Prenatal care and monitoring throughout pregnancy
 * - Labor support and delivery
 * - Postpartum care for mother and newborn
 * - Breastfeeding support and infant feeding guidance
 * - Reproductive health and family planning
 *
 * High-risk pregnancies and complications requiring surgical intervention are managed
 * in coordination with the Emergency Department and transferred if necessary.
 *
 * Total staffing: ~20–30 FTEs
 */
export class BirthingCenter extends FunctionalUnit {
    constructor() {
        super("Birthing Center", "Provides prenatal, delivery, and postpartum care for community members.");
    }
}
