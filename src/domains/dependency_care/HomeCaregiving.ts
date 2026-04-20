import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * HomeCaregiving formalizes the care work that family members and close community
 * members already provide for dependent relatives at home.
 *
 * This care was always happening. In the current economy it is invisible, uncompensated,
 * and economically punishing — a daughter who reduces her hours to care for her mother
 * loses income, career progression, and eventually retirement security. The community
 * economy resolves this by recognizing home caregiving as a community position, paid
 * through the normal payroll system.
 *
 * A HomeCaregiving position covers:
 * - Daily personal care (bathing, dressing, grooming, toileting)
 * - Meal preparation and feeding assistance
 * - Medication reminders and health monitoring
 * - Mobility assistance and fall prevention
 * - Companionship and social engagement
 * - Coordination with the Clinic for medical needs
 *
 * The caregiver and the person receiving care live in the same or adjacent household.
 * The care recipient's DependencyCareProfile records their ADL needs, which inform
 * the expected time commitment and position classification.
 *
 * HomeCaregiving is the preferred model wherever it is safe and sustainable. It keeps
 * dependent members in familiar environments with people who know and love them, which
 * consistently produces better outcomes than institutional care.
 */
export class HomeCaregiving extends FunctionalUnit {
    constructor() {
        super("Home Caregiving", "Provides paid positions for community members caring for dependent relatives at home.");
    }

    getType(): string { return "home-caregiving"; }

}
