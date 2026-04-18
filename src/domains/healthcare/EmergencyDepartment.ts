import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * The Emergency Department provides 24/7 emergency, trauma, and inpatient care.
 *
 * This is the unit that cannot close. At any hour, members need somewhere to go
 * for acute illness, injury, cardiac events, strokes, and obstetric emergencies.
 * An Emergency Department requires continuous staffing, which is the primary cost
 * driver — three full rotations of staff to cover 24 hours, 7 days a week.
 *
 * At 30,000 members, a 25–50 bed inpatient facility is appropriate. This covers:
 * - Emergency stabilization and triage
 * - Short-term inpatient care (observation, recovery from basic surgery)
 * - Trauma response
 * - Overflow from other units during illness surges
 *
 * Cases requiring specialist intervention (neurosurgery, cardiac catheterization,
 * oncology, neonatal ICU) are stabilized here and transferred out. The community
 * cannot maintain those specialties at this population scale, but it can keep
 * someone alive long enough to get them to where those resources exist.
 *
 * Total staffing: ~80–100 FTEs (driven by continuous shift coverage)
 */
export class EmergencyDepartment extends FunctionalUnit {
    constructor() {
        super("Emergency Department", "Provides 24/7 emergency, trauma, and inpatient care for the community.");
    }
}
