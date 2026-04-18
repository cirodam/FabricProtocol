import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * VocationalTraining bridges the Education domain and every other functional domain.
 *
 * Formal schooling produces general literacy and reasoning. Vocational training produces
 * the specific competencies the community depends on to function — the next mill
 * operator, nurse, electrician, farmer, plumber, teacher. Without a deliberate pipeline
 * for these skills, the community is dependent on whoever happens to already have them,
 * and loses capacity every time someone departs or ages out of a role.
 *
 * VocationalTraining operates through apprenticeship and structured mentorship within
 * existing functional units. A trainee spends time in the Mill, the Bakery, the Clinic,
 * the Farm — working under experienced members who hold teaching positions. The
 * VocationalTraining unit coordinates those placements, tracks progress, and ensures
 * that critical skill gaps are being filled.
 *
 * This unit has coordination relationships with every other functional domain. It should
 * maintain a skills registry: which competencies exist in the community, where they are
 * concentrated, and where they are dangerously thin. A community where only one person
 * knows how to operate the mill is fragile in a way that is easy to fix — if someone
 * is paying attention.
 */
export class VocationalTraining extends FunctionalUnit {
    constructor() {
        super("Vocational Training", "Develops community-specific skills through apprenticeship and structured mentorship across all functional domains.");
    }
}
