import { Location, LocationType } from "./Location.js";
import { Address } from "./Address.js";
import { LocationLoader } from "./LocationLoader.js";

export class LocationRegistry {
    private static instance: LocationRegistry;
    private locations: Map<string, Location> = new Map();
    private loader: LocationLoader | null = null;

    private constructor() {}

    static getInstance(): LocationRegistry {
        if (!LocationRegistry.instance) {
            LocationRegistry.instance = new LocationRegistry();
        }
        return LocationRegistry.instance;
    }

    init(loader: LocationLoader): void {
        this.loader = loader;
        for (const loc of loader.loadAll()) {
            this.locations.set(loc.id, loc);
        }
    }

    add(location: Location): void {
        this.locations.set(location.id, location);
        this.loader?.save(location);
    }

    save(location: Location): void {
        this.loader?.save(location);
    }

    get(id: string): Location | undefined {
        return this.locations.get(id);
    }

    getAll(): Location[] {
        return Array.from(this.locations.values());
    }

    getByType(type: LocationType): Location[] {
        return this.getAll().filter(l => l.type === type);
    }

    getByLinkedEntity(entityId: string): Location | undefined {
        return this.getAll().find(l => l.linkedEntityId === entityId);
    }

    remove(id: string): boolean {
        const existed = this.locations.delete(id);
        if (existed) this.loader?.delete(id);
        return existed;
    }
}
