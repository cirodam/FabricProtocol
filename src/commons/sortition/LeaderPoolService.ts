import { LeaderPool } from "./LeaderPool.js";
import { LeaderPoolLoader } from "./LeaderPoolLoader.js";

export class LeaderPoolService {
    private static instance: LeaderPoolService;

    private pools: Map<string, LeaderPool> = new Map();
    private loader: LeaderPoolLoader | null = null;

    private constructor() {}

    static getInstance(): LeaderPoolService {
        if (!LeaderPoolService.instance) {
            LeaderPoolService.instance = new LeaderPoolService();
        }
        return LeaderPoolService.instance;
    }

    init(loader: LeaderPoolLoader): void {
        this.loader = loader;
        for (const pool of loader.loadAll()) {
            this.pools.set(pool.id, pool);
        }
    }

    add(pool: LeaderPool): void {
        this.pools.set(pool.id, pool);
        this.loader?.save(pool);
    }

    save(pool: LeaderPool): void {
        this.loader?.save(pool);
    }

    get(id: string): LeaderPool | undefined {
        return this.pools.get(id);
    }

    getAll(): LeaderPool[] {
        return Array.from(this.pools.values());
    }

    remove(id: string): boolean {
        const existed = this.pools.delete(id);
        if (existed) this.loader?.delete(id);
        return existed;
    }
}
