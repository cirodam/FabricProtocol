import { DomainCouncil, type CouncilSeat } from "./DomainCouncil.js";
import { FileStore } from "../../storage/FileStore.js";

interface SeatRecord {
    memberId: string;
    seatedAt: string;
}

interface DomainCouncilRecord {
    domainId: string;
    domainName: string;
    poolId: string | null;
    seats: SeatRecord[];
}

export class DomainCouncilLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(council: DomainCouncil): void {
        const record: DomainCouncilRecord = {
            domainId:   council.domainId,
            domainName: council.domainName,
            poolId:     council.poolId,
            seats:      council.getSeats().map(s => ({
                memberId: s.memberId,
                seatedAt: s.seatedAt.toISOString(),
            })),
        };
        this.store.write(council.domainId, record);
    }

    loadAll(): DomainCouncil[] {
        return this.store.readAll<DomainCouncilRecord>().map(r => this.fromRecord(r));
    }

    private fromRecord(r: DomainCouncilRecord): DomainCouncil {
        const council = new DomainCouncil(r.domainId, r.domainName, r.poolId ?? null);
        for (const s of r.seats ?? []) {
            (council as unknown as { seats: CouncilSeat[] }).seats.push({
                memberId: s.memberId,
                seatedAt: new Date(s.seatedAt),
            });
        }
        return council;
    }
}

