import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * The Clinic provides primary care for the community.
 *
 * Primary care is the backbone of any functioning health system. It handles roughly
 * 80% of all care needs: family medicine, preventive care, chronic disease management
 * (diabetes, hypertension, asthma), vaccinations, and routine screenings. When primary
 * care works well, expensive emergency and specialist interventions are far less frequent.
 *
 * In the US, primary care has been systematically underfunded because it is not
 * profitable — preventive care that keeps people healthy generates less revenue than
 * treating crises. In a community economy that calculus is reversed: keeping members
 * healthy reduces the burden on every other part of the care system.
 *
 * The Clinic operates on a panel model: each physician or nurse practitioner maintains
 * a roster of assigned members. At 30,000 members, the recommended panel size of
 * 1,500–2,000 patients per provider implies 15–20 primary care providers, plus
 * nursing staff, medical assistants, and coordination staff.
 *
 * Total staffing: ~60–80 FTEs
 */
export class Clinic extends FunctionalUnit {
    constructor() {
        super("Clinic", "Provides primary care, preventive medicine, and chronic disease management for community members.");
    }
}
