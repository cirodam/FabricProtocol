import { Location, LocationType } from "./Location.js";
import { Address } from "./Address.js";
import { FileStore } from "../storage/FileStore.js";

interface LocationRecord {
    id:             string;
    label:          string;
    address:        Address;
    latitude:       number;
    longitude:      number;
    type:           LocationType;
    linkedEntityId: string | null;
    notes:          string;
    createdAt:      string;
}

export class LocationLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(location: Location): void {
        const record: LocationRecord = {
            id:             location.id,
            label:          location.label,
            address:        location.address,
            latitude:       location.latitude,
            longitude:      location.longitude,
            type:           location.type,
            linkedEntityId: location.linkedEntityId,
            notes:          location.notes,
            createdAt:      location.createdAt.toISOString(),
        };
        this.store.write(location.id, record);
    }

    loadAll(): Location[] {
        return this.store.readAll<LocationRecord>().map(r => {
            const loc = new Location(r.label, r.address, r.latitude, r.longitude, r.type);
            const l = loc as unknown as Record<string, unknown>;
            l["id"]             = r.id;
            l["linkedEntityId"] = r.linkedEntityId ?? null;
            l["notes"]          = r.notes ?? "";
            l["createdAt"]      = new Date(r.createdAt);
            return loc;
        });
    }

    delete(id: string): boolean {
        return this.store.delete(id);
    }
}
