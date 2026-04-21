import { CitizensAssembly } from "./CitizensAssembly.js";
import { CitizensAssemblyLoader } from "./CitizensAssemblyLoader.js";

export class AssemblyService {
    private static instance: AssemblyService;
    private assembly: CitizensAssembly | null = null;
    private loader: CitizensAssemblyLoader | null = null;

    private constructor() {}

    static getInstance(): AssemblyService {
        if (!AssemblyService.instance) {
            AssemblyService.instance = new AssemblyService();
        }
        return AssemblyService.instance;
    }

    init(loader: CitizensAssemblyLoader): void {
        this.loader   = loader;
        this.assembly = loader.load() ?? null;
    }

    /** Returns the assembly, creating and persisting it if it doesn't exist yet. */
    getOrCreate(): CitizensAssembly {
        if (!this.assembly) {
            this.assembly = new CitizensAssembly();
            this.loader?.save(this.assembly);
        }
        return this.assembly;
    }

    get(): CitizensAssembly | undefined {
        return this.assembly ?? undefined;
    }

    save(): void {
        if (this.assembly) this.loader?.save(this.assembly);
    }

    /**
     * Fill assembly vacancies by sortition from all active member IDs.
     * Returns the IDs of members drawn.
     */
    draw(activeMemberIds: string[]): string[] {
        const assembly  = this.getOrCreate();
        const count     = activeMemberIds.length;
        const vacancies = assembly.vacanciesFor(count);
        if (vacancies === 0) return [];

        const seated   = new Set(assembly.seatedMemberIds());
        const eligible = activeMemberIds.filter(id => !seated.has(id));
        const toDraw   = Math.min(vacancies, eligible.length);

        for (let i = 0; i < toDraw; i++) {
            const j = i + Math.floor(Math.random() * (eligible.length - i));
            [eligible[i], eligible[j]] = [eligible[j]!, eligible[i]!];
        }
        const drawn = eligible.slice(0, toDraw);
        for (const memberId of drawn) assembly.addSeat(memberId, count);
        this.loader?.save(assembly);
        return drawn;
    }
}
