import { SortitionPool } from "./SortitionPool.js";
import { FileStore } from "../../storage/FileStore.js";

interface SortitionPoolRecord {
    id: string;
    name: string;
    description: string;
    memberIds: string[];
    createdAt: string;
}

export class SortitionPoolLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(pool: SortitionPool): void {
        const record: SortitionPoolRecord = {
            id:          pool.id,
            name:        pool.name,
            description: pool.description,
            memberIds:   pool.getMembers(),
            createdAt:   pool.createdAt.toISOString(),
        };
        this.store.write(pool.id, record);
    }

    loadAll(): SortitionPool[] {
        return this.store.readAll<SortitionPoolRecord>().map(r => this.fromRecord(r));
    }

    delete(id: string): boolean {
        return this.store.delete(id);
    }

    private fromRecord(r: SortitionPoolRecord): SortitionPool {
        const pool = new SortitionPool(r.name, r.description);
        (pool as unknown as Record<string, unknown>)["id"]        = r.id;
        (pool as unknown as Record<string, unknown>)["createdAt"] = new Date(r.createdAt);
        for (const memberId of r.memberIds ?? []) {
            pool.addMember(memberId);
        }
        return pool;
    }
}
