import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * A Clinic provides primary care for the community.
 *
 * Primary care handles roughly 80% of all care needs: family medicine, preventive care,
 * chronic disease management (diabetes, hypertension, asthma), vaccinations, and routine
 * screenings. A community may operate multiple clinics serving different neighbourhoods.
 */
export class Clinic extends FunctionalUnit {
    readonly createdAt: Date;

    constructor(name: string, description: string = "Provides primary care, preventive medicine, and chronic disease management.") {
        super(name, description);
        this.createdAt = new Date();
    }

    getType(): string { return "clinic"; }
}
