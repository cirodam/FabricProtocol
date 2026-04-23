import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { CommunityRole } from "../../commons/CommunityRole.js";
import { Clinic } from "./Clinic.js";
import { ClinicLoader } from "./ClinicLoader.js";
import { DentalClinic } from "./DentalClinic.js";
import { DentalClinicLoader } from "./DentalClinicLoader.js";

export class HealthcareDomain extends FunctionalDomain {
    private static instance: HealthcareDomain;
    private loader: ClinicLoader | null = null;
    private dentalLoader: DentalClinicLoader | null = null;

    constructor() {
        super("Healthcare", "Provides medical care and health services to community members.",
            "00000000-0000-0000-0000-000000000004");
        this.addRole(new CommunityRole(
            "Healthcare Coordinator",
            "Coordinates community health services, liaises with clinics and practitioners, and ensures members can access care.",
            700,
        ));
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
        this.registerUnitType("clinic",
            u => this.loader?.save(u as Clinic),
            id => { this.removeUnit(id); this.loader?.delete(id); },
        );
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

    // ── Dental clinics ───────────────────────────────────────────────────────

    initDentalClinics(loader: DentalClinicLoader): void {
        this.dentalLoader = loader;
        for (const clinic of loader.loadAll()) {
            this.addUnit(clinic);
        }
        this.registerUnitType("dental-clinic",
            u => this.dentalLoader?.save(u as DentalClinic),
            id => { this.removeUnit(id); this.dentalLoader?.delete(id); },
        );
    }

    addDentalClinic(clinic: DentalClinic): void {
        this.addUnit(clinic);
        this.dentalLoader?.save(clinic);
    }

    saveDentalClinic(clinic: DentalClinic): void {
        this.dentalLoader?.save(clinic);
    }

    getDentalClinic(id: string): DentalClinic | undefined {
        return this.getUnitsByType<DentalClinic>("dental-clinic").find(u => u.id === id);
    }

    getAllDentalClinics(): DentalClinic[] {
        return this.getUnitsByType<DentalClinic>("dental-clinic");
    }

    removeDentalClinic(id: string): void {
        this.removeUnit(id);
        this.dentalLoader?.delete(id);
    }
}
