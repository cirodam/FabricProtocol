import { DomainCouncil } from "./DomainCouncil.js";
import { DomainCouncilLoader } from "./DomainCouncilLoader.js";

export class CouncilService {
    private static instance: CouncilService;

    /** Keyed by domainId */
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
            this.councils.set(council.domainId, council);
        }
    }

    /**
     * Returns the council for a domain, creating and persisting one if it
     * does not yet exist. Called once per domain at startup.
     */
    getOrCreateCouncil(domainId: string, domainName: string): DomainCouncil {
        let council = this.councils.get(domainId);
        if (!council) {
            council = new DomainCouncil(domainId, domainName);
            this.councils.set(domainId, council);
            this.loader?.save(council);
        }
        return council;
    }

    saveCouncil(council: DomainCouncil): void {
        this.loader?.save(council);
    }

    getCouncil(domainId: string): DomainCouncil | undefined {
        return this.councils.get(domainId);
    }

    getAllCouncils(): DomainCouncil[] {
        return Array.from(this.councils.values());
    }
}

