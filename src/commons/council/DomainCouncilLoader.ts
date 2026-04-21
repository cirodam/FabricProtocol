import { DomainCouncil, type CouncilSeat } from "./DomainCouncil.js";
import { FileStore } from "../../storage/FileStore.js";

interface SeatRecord {
    memberId: string;
    seatedAt: string;
}

interface DomainCouncilRecord {
    id:         string;
    name:       string;
    domainIds:  string[];
    targetSize: number;
    poolId:     string | null;
    seats:      SeatRecord[];
}

export class DomainCouncilLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(council: DomainCouncil): void {
        const record: DomainCouncilRecord = {
            id:         council.id,
            name:       council.name,
            domainIds:  council.domainIds,
            targetSize: council.targetSize,
            poolId:     council.poolId,
            seats:      council.getSeats().map(s => ({
                memberId: s.memberId,
                seatedAt: s.seatedAt.toISOString(),
            })),
        };
        this.store.write(council.id, record);
    }

    loadAll(): DomainCouncil[] {
        return this.store.readAll<DomainCouncilRecord>().map(r => this.fromRecord(r));
    }

    load(id: string): DomainCouncil | undefined {
        const r = this.store.read<DomainCouncilRecord>(id);
        return r ? this.fromRecord(r) : undefined;
    }

    delete(id: string): boolean {
        return this.store.delete(id);
    }

    private fromRecord(r: DomainCouncilRecord): DomainCouncil {
        const council = new DomainCouncil(
            r.name,
            r.domainIds ?? [],
            r.poolId ?? null,
            r.targetSize ?? DomainCouncil.DEFAULT_SIZE,
            r.id,
        );
        for (const s of r.seats ?? []) {
            (council as unknown as { seats: CouncilSeat[] }).seats.push({
                memberId: s.memberId,
                seatedAt: new Date(s.seatedAt),
            });
        }
        return council;
    }
}

