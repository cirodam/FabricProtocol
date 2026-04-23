import { FunctionalUnit } from "../commons/domain/FunctionalUnit.js";
import { FileStore } from "./FileStore.js";
import { CommunityRole } from "../commons/CommunityRole.js";

interface RoleRecord {
    id: string;
    title: string;
    description: string;
    memberId: string | null;
    kinPerMonth: number;
    termStartDate: string | null;
    termEndDate: string | null;
}

interface UnitRecord {
    id: string;
    domainId: string;
    name: string;
    type: string;
    description: string;
    roles: RoleRecord[];
    createdAt: string;
}

export class GenericUnitLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(unit: FunctionalUnit, domainId: string): void {
        const record: UnitRecord = {
            id:          unit.id,
            domainId,
            name:        unit.name,
            type:        unit.getType(),
            description: unit.description,
            roles:       unit.getRoles().map(r => ({
                id:            r.id,
                title:         r.title,
                description:   r.description,
                memberId:      r.memberId,
                kinPerMonth:   r.kinPerMonth,
                termStartDate: r.termStartDate?.toISOString() ?? null,
                termEndDate:   r.termEndDate?.toISOString()   ?? null,
            })),
            createdAt: unit.createdAt.toISOString(),
        };
        this.store.write(unit.id, record);
    }

    loadAll(): { unit: FunctionalUnit; domainId: string }[] {
        const results: { unit: FunctionalUnit; domainId: string }[] = [];
        for (const raw of this.store.readAll<UnitRecord>()) {
            const unit = new FunctionalUnit(raw.name, raw.description, raw.type, raw.id);
            // Restore createdAt (readonly field — constructor sets current time)
            Object.defineProperty(unit, "createdAt", {
                value: new Date(raw.createdAt), writable: false,
            });
            unit.clearRoles();
            for (const r of raw.roles) {
                const role = new CommunityRole(r.title, r.description, r.kinPerMonth);
                role.memberId = r.memberId;
                Object.defineProperty(role, "id", { value: r.id, writable: false });
                if (r.termStartDate) role.termStartDate = new Date(r.termStartDate);
                if (r.termEndDate)   role.termEndDate   = new Date(r.termEndDate);
                unit.addRole(role);
            }
            results.push({ unit, domainId: raw.domainId });
        }
        return results;
    }

    delete(id: string): void {
        this.store.delete(id);
    }
}
