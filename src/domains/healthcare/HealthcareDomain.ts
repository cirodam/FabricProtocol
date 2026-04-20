import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { Clinic } from "./Clinic.js";
import { ClinicLoader } from "./ClinicLoader.js";

export class HealthcareDomain extends FunctionalDomain {
    private static instance: HealthcareDomain;
    private loader: ClinicLoader | null = null;

    constructor() {
        super("Healthcare", "Provides medical care and health services to community members.",
            "00000000-0000-0000-0000-000000000004");
    }

    static getInstance(): HealthcareDomain {
        if (!HealthcareDomain.instance) {
            HealthcareDomain.instance = new HealthcareDomain();
        }
        return HealthcareDomain.instance;
    }

    init(loader: ClinicLoader): void {
        this.loader = loader;
        for (const clinic of loader.loadAll()) {
            this.addUnit(clinic);
        }
    }

    addClinic(clinic: Clinic): void {
        this.addUnit(clinic);
        this.loader?.save(clinic);
    }

    saveClinic(clinic: Clinic): void {
        this.loader?.save(clinic);
    }

    getClinic(id: string): Clinic | undefined {
        return this.getUnits().find(u => u.id === id) as Clinic | undefined;
    }

    getAllClinics(): Clinic[] {
        return this.getUnitsByType<Clinic>("clinic");
    }

    removeClinic(id: string): void {
        this.removeUnit(id);
        this.loader?.delete(id);
    }
}
