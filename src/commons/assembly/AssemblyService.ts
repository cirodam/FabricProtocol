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
}
