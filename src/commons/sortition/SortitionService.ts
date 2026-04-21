import { SortitionPool } from "./SortitionPool.js";
import { SortitionPoolLoader } from "./SortitionPoolLoader.js";

/**
 * Singleton service that manages the community's collection of sortition pools.
 */
export class SortitionService {
    private static instance: SortitionService;

    private pools: Map<string, SortitionPool> = new Map();
    private loader: SortitionPoolLoader | null = null;

    private constructor() {}

    static getInstance(): SortitionService {
        if (!SortitionService.instance) {
            SortitionService.instance = new SortitionService();
        }
        return SortitionService.instance;
    }

    init(loader: SortitionPoolLoader): void {
        this.loader = loader;
        for (const pool of loader.loadAll()) {
            this.pools.set(pool.id, pool);
        }
    }

    addPool(pool: SortitionPool): void {
        this.pools.set(pool.id, pool);
        this.loader?.save(pool);
    }

    savePool(pool: SortitionPool): void {
        this.loader?.save(pool);
    }

    getPool(id: string): SortitionPool | undefined {
        return this.pools.get(id);
    }

    getAllPools(): SortitionPool[] {
        return Array.from(this.pools.values());
    }

    removePool(id: string): boolean {
        const existed = this.pools.delete(id);
        if (existed) this.loader?.delete(id);
        return existed;
    }
}
