import { LeaderPool, type CouncilSeat } from "./LeaderPool.js";
import { FileStore } from "../../storage/FileStore.js";

interface SeatRecord {
    memberId: string;
    seatedAt: string;
}

interface LeaderPoolRecord {
    id: string;
    poolName: string;
    memberIds: string[];
    createdAt: string;
    councilSeats: SeatRecord[];
}

export class LeaderPoolLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(pool: LeaderPool): void {
        const record: LeaderPoolRecord = {
            id:          pool.id,
            poolName:    pool.poolName,
            memberIds:   pool.getMembers(),
            createdAt:   pool.createdAt.toISOString(),
            councilSeats: pool.getCouncilSeats().map(s => ({
                memberId: s.memberId,
                seatedAt: s.seatedAt.toISOString(),
            })),
        };
        this.store.write(pool.id, record);
    }

    loadAll(): LeaderPool[] {
        return this.store.readAll<LeaderPoolRecord>().map(r => this.fromRecord(r));
    }

    delete(id: string): boolean {
        return this.store.delete(id);
    }

    private fromRecord(r: LeaderPoolRecord): LeaderPool {
        const pool = new LeaderPool(r.poolName);
        (pool as unknown as Record<string, unknown>)["id"]        = r.id;
        (pool as unknown as Record<string, unknown>)["createdAt"] = new Date(r.createdAt);
        for (const memberId of r.memberIds ?? []) {
            pool.addMember(memberId);
        }
        for (const s of r.councilSeats ?? []) {
            (pool as unknown as { councilSeats: CouncilSeat[] }).councilSeats.push({
                memberId: s.memberId,
                seatedAt: new Date(s.seatedAt),
            });
        }
        return pool;
    }
}
