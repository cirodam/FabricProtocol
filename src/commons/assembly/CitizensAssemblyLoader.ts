import { CitizensAssembly, type AssemblySeat } from "./CitizensAssembly.js";
import { FileStore } from "../../storage/FileStore.js";

interface SeatRecord {
    memberId: string;
    seatedAt: string;
}

interface AssemblyRecord {
    seats: SeatRecord[];
}

export class CitizensAssemblyLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(assembly: CitizensAssembly): void {
        const record: AssemblyRecord = {
            seats: assembly.getSeats().map(s => ({
                memberId: s.memberId,
                seatedAt: s.seatedAt.toISOString(),
            })),
        };
        this.store.write("instance", record);
    }

    load(): CitizensAssembly | undefined {
        const r = this.store.read<AssemblyRecord>("instance");
        if (!r) return undefined;
        return this.fromRecord(r);
    }

    private fromRecord(r: AssemblyRecord): CitizensAssembly {
        const assembly = new CitizensAssembly();
        for (const s of r.seats ?? []) {
            (assembly as unknown as { seats: AssemblySeat[] }).seats.push({
                memberId: s.memberId,
                seatedAt: new Date(s.seatedAt),
            });
        }
        return assembly;
    }
}
