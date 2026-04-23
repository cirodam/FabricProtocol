import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { CommunityRole } from "../../commons/CommunityRole.js";
import { DependencyCareProfile, CareNeeds } from "./DependencyCareProfile.js";
import { SharedHousehold } from "./SharedHousehold.js";
import { SharedHouseholdLoader } from "./SharedHouseholdLoader.js";
import { MedicalCareUnit } from "./MedicalCareUnit.js";
import { MedicalCareUnitLoader } from "./MedicalCareUnitLoader.js";
import { HomeCaregiving } from "./HomeCaregiving.js";
import { HomeCaregivingLoader } from "./HomeCaregivingLoader.js";

export class DependencyCareDomain extends FunctionalDomain {
    private static readonly DOMAIN_ID = "00000000-0000-0000-0000-000000000011";
    private static instance: DependencyCareDomain;

    private profiles: Map<string, DependencyCareProfile> = new Map();
    private householdLoader: SharedHouseholdLoader | null = null;
    private medicalCareUnitLoader: MedicalCareUnitLoader | null = null;
    private homeCaregivingLoader: HomeCaregivingLoader | null = null;
    private homeCaregivingUnit: HomeCaregiving | null = null;

    private constructor() {
        super("DependencyCare", "Supports members with chronic illness, disability, or other ongoing care needs.", DependencyCareDomain.DOMAIN_ID);
        this.addRole(new CommunityRole(
            "Dependency Care Coordinator",
            "Coordinates shared households, medical care units, and home caregiving programs; ensures members with chronic illness, disability, or ageing needs receive consistent support.",
            700,
        ));
    }

    static getInstance(): DependencyCareDomain {
        if (!DependencyCareDomain.instance) {
            DependencyCareDomain.instance = new DependencyCareDomain();
        }
        return DependencyCareDomain.instance;
    }

    // ── Shared Households ───────────────────────────────────────────────────

    initHouseholds(loader: SharedHouseholdLoader): void {
        this.householdLoader = loader;
        for (const h of loader.loadAll()) {
            this.addUnit(h);
        }
    }

    addHousehold(household: SharedHousehold): void {
        this.addUnit(household);
        this.householdLoader?.save(household);
    }

    saveHousehold(household: SharedHousehold): void {
        this.householdLoader?.save(household);
    }

    getHousehold(id: string): SharedHousehold | undefined {
        return this.getUnitsByType<SharedHousehold>("shared-household").find(h => h.id === id);
    }

    getAllHouseholds(): SharedHousehold[] {
        return this.getUnitsByType<SharedHousehold>("shared-household");
    }

    removeHousehold(id: string): void {
        this.removeUnit(id);
        this.householdLoader?.delete(id);
    }

    // ── Medical Care Units ───────────────────────────────────────────────────

    initMedicalCareUnits(loader: MedicalCareUnitLoader): void {
        this.medicalCareUnitLoader = loader;
        for (const u of loader.loadAll()) {
            this.addUnit(u);
        }
    }

    addMedicalCareUnit(unit: MedicalCareUnit): void {
        this.addUnit(unit);
        this.medicalCareUnitLoader?.save(unit);
    }

    saveMedicalCareUnit(unit: MedicalCareUnit): void {
        this.medicalCareUnitLoader?.save(unit);
    }

    getMedicalCareUnit(id: string): MedicalCareUnit | undefined {
        return this.getUnitsByType<MedicalCareUnit>("medical-care-unit").find(u => u.id === id);
    }

    getAllMedicalCareUnits(): MedicalCareUnit[] {
        return this.getUnitsByType<MedicalCareUnit>("medical-care-unit");
    }

    removeMedicalCareUnit(id: string): void {
        this.removeUnit(id);
        this.medicalCareUnitLoader?.delete(id);
    }

    // ── Home Caregiving ──────────────────────────────────────────────────────

    initHomeCaregiving(loader: HomeCaregivingLoader): void {
        this.homeCaregivingLoader = loader;
        const existing = loader.load();
        if (existing) {
            this.homeCaregivingUnit = existing;
            this.addUnit(existing);
        } else {
            const unit = new HomeCaregiving();
            this.homeCaregivingUnit = unit;
            this.addUnit(unit);
            loader.save(unit);
        }
    }

    getHomeCaregiving(): HomeCaregiving | null {
        return this.homeCaregivingUnit;
    }

    saveHomeCaregiving(): void {
        if (this.homeCaregivingUnit) {
            this.homeCaregivingLoader?.save(this.homeCaregivingUnit);
        }
    }

    // ── Care Profiles ────────────────────────────────────────────────────────

    addProfile(memberId: string, careNeeds: CareNeeds, notes: string = ""): DependencyCareProfile {
        const profile = new DependencyCareProfile(memberId, careNeeds, notes);
        this.profiles.set(profile.id, profile);
        return profile;
    }

    getProfile(profileId: string): DependencyCareProfile | undefined {
        return this.profiles.get(profileId);
    }

    getProfileByMember(memberId: string): DependencyCareProfile | undefined {
        return Array.from(this.profiles.values()).find((p) => p.memberId === memberId);
    }

    getAllProfiles(): DependencyCareProfile[] {
        return Array.from(this.profiles.values());
    }

    removeProfile(profileId: string): void {
        this.profiles.delete(profileId);
    }
}
