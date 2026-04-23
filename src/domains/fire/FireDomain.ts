import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { FireCompany } from "./FireCompany.js";
import { FireCompanyLoader } from "./FireCompanyLoader.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

/**
 * The Fire domain protects the community from fire and provides emergency rescue services.
 *
 * Rural volunteer fire departments are one of the oldest and most successful examples
 * of community-organized mutual aid in the United States. Most rural communities have
 * relied on volunteer departments for generations — members who train together, maintain
 * equipment collectively, and respond when called. This is not a lesser version of
 * professional fire service; for the call types that dominate rural departments
 * (structure fires, vehicle accidents, brush fires, medical assist), it works.
 *
 * In a community economy, the distinction between "volunteer" and "paid" shifts. Core
 * firefighters hold community positions and are compensated — fire response is skilled,
 * dangerous work that deserves recognition as community labor. Members who participate
 * part-time or on-call may hold partial positions. The department is funded by the
 * Commons rather than by property tax or donation drives.
 *
 * This domain also coordinates with the Healthcare domain for medical emergency
 * response — in many rural areas, the fire department is the first medical responder
 * because it arrives before an ambulance.
 */
export class FireDomain extends FunctionalDomain {
    private static readonly DOMAIN_ID = "00000000-0000-0000-0000-000000000013";
    private static instance: FireDomain;

    private companyLoader: FireCompanyLoader | null = null;

    private constructor() {
        super("Fire", "Protects the community from fire and provides emergency rescue and first response services.", FireDomain.DOMAIN_ID);
        this.addRole(new CommunityRole("Fire Chief", "Leads fire companies, coordinates emergency response, and maintains equipment readiness.", 700));
    }

    static getInstance(): FireDomain {
        if (!FireDomain.instance) {
            FireDomain.instance = new FireDomain();
        }
        return FireDomain.instance;
    }

    // ── Fire Companies ────────────────────────────────────────────────────────

    initCompanies(loader: FireCompanyLoader): void {
        this.companyLoader = loader;
        for (const c of loader.loadAll()) {
            this.addUnit(c);
        }
    }

    addCompany(company: FireCompany): void {
        this.addUnit(company);
        this.companyLoader?.save(company);
    }

    saveCompany(company: FireCompany): void {
        this.companyLoader?.save(company);
    }

    getCompany(id: string): FireCompany | undefined {
        return this.getUnitsByType<FireCompany>("fire-company").find(c => c.id === id);
    }

    getAllCompanies(): FireCompany[] {
        return this.getUnitsByType<FireCompany>("fire-company");
    }

    removeCompany(id: string): void {
        this.removeUnit(id);
        this.companyLoader?.delete(id);
    }
}
