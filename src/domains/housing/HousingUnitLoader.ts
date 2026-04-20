import { FileStore } from "../../storage/FileStore.js";
import { HousingUnit } from "./HousingUnit.js";

interface HousingUnitRecord {
    id: string;
    ownerId: string;
    name: string;
    latitude: number;
    longitude: number;
    hasRunningWater: boolean;
    hasToilet: boolean;
    hasElectricity: boolean;
    hasHeating: boolean;
    hasCooking: boolean;
    isHabitable: boolean;
    memberIds: string[];
    createdAt: string;
}

export class HousingUnitLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(unit: HousingUnit): void {
        const record: HousingUnitRecord = {
            id:              unit.id,
            ownerId:         unit.ownerId,
            name:            unit.name,
            latitude:        unit.latitude,
            longitude:       unit.longitude,
            hasRunningWater: unit.hasRunningWater,
            hasToilet:       unit.hasToilet,
            hasElectricity:  unit.hasElectricity,
            hasHeating:      unit.hasHeating,
            hasCooking:      unit.hasCooking,
            isHabitable:     unit.isHabitable,
            memberIds:       unit.getMembers(),
            createdAt:       unit.createdAt.toISOString(),
        };
        this.store.write(unit.id, record);
    }

    delete(unitId: string): void {
        this.store.delete(unitId);
    }

    loadAll(): HousingUnit[] {
        return this.store.readAll<HousingUnitRecord>().map(r => {
            const unit = new HousingUnit(r.ownerId, r.name, r.latitude, r.longitude);
            const u = unit as unknown as Record<string, unknown>;
            u["id"]              = r.id;
            u["hasRunningWater"] = r.hasRunningWater;
            u["hasToilet"]       = r.hasToilet;
            u["hasElectricity"]  = r.hasElectricity;
            u["hasHeating"]      = r.hasHeating;
            u["hasCooking"]      = r.hasCooking;
            u["isHabitable"]     = r.isHabitable;
            u["createdAt"]       = new Date(r.createdAt);
            for (const memberId of r.memberIds ?? []) {
                unit.addMember(memberId);
            }
            return unit;
        });
    }
}
