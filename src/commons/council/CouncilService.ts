import { DomainCouncil } from "./DomainCouncil.js";
import { DomainCouncilLoader } from "./DomainCouncilLoader.js";

export class CouncilService {
    private static instance: CouncilService;

    /** Keyed by council.id */
    private councils: Map<string, DomainCouncil> = new Map();
    private loader: DomainCouncilLoader | null = null;

    private constructor() {}

    static getInstance(): CouncilService {
        if (!CouncilService.instance) {
            CouncilService.instance = new CouncilService();
        }
        return CouncilService.instance;
    }

    init(loader: DomainCouncilLoader): void {
        this.loader = loader;
        for (const council of loader.loadAll()) {
            this.councils.set(council.id, council);
        }
    }

    /** Create a new council and persist it. */
    create(name: string, domainIds: string[], targetSize?: number): DomainCouncil {
        const council = new DomainCouncil(name, domainIds, null, targetSize);
        this.councils.set(council.id, council);
        this.loader?.save(council);
        return council;
    }

    saveCouncil(council: DomainCouncil): void {
        this.loader?.save(council);
    }

    getCouncil(id: string): DomainCouncil | undefined {
        return this.councils.get(id);
    }

    /** Returns the council whose domainIds includes the given domainId. */
    getCouncilForDomain(domainId: string): DomainCouncil | undefined {
        for (const c of this.councils.values()) {
            if (c.domainIds.includes(domainId)) return c;
        }
        return undefined;
    }

    getAllCouncils(): DomainCouncil[] {
        return Array.from(this.councils.values());
    }

    delete(id: string): void {
        this.councils.delete(id);
        this.loader?.delete(id);
    }

    /**
     * Seed the 6 default councils if no councils exist yet.
     * Called once at startup after init().
     */
    seedDefaults(): void {
        if (this.councils.size > 0) return;
        const defaults: [string, string[]][] = [
            ["Sustenance Council",      ["food", "agriculture", "water"]],
            ["Care Council",            ["healthcare", "dependency-care", "child-care", "deathcare"]],
            ["Infrastructure Council",  ["housing", "energy", "sanitation", "transport"]],
            ["Commons Council",         ["education", "enrichment", "communications"]],
            ["Safety Council",          ["fire", "justice"]],
            ["Economy Council",         ["marketplace", "manufacturing", "courier"]],
        ];
        for (const [name, domainIds] of defaults) {
            this.create(name, domainIds);
        }
    }
}

