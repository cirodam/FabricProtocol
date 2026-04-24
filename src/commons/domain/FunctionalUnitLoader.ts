import { FileStore } from "../../storage/FileStore.js";
import { FunctionalUnit } from "./FunctionalUnit.js";
import { CommunityRole } from "../CommunityRole.js";

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
    type: string;
    name: string;
    description: string;
    memberIds: string[];
    roles: RoleRecord[];
    createdAt: string;
}

/**
 * Generic persistence layer for any FunctionalUnit subclass.
 * All unit types share the same JSON shape on disk — id, type, name,
 * description, memberIds, roles, createdAt. The `type` field drives
 * filtering in FunctionalDomain; no per-type loader is needed.
 */
export class FunctionalUnitLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(unit: FunctionalUnit): void {
        const record: UnitRecord = {
            id:          unit.id,
            type:        unit.getType(),
            name:        unit.name,
            description: unit.description,
            memberIds:   unit.getMembers(),
            roles: unit.getRoles().map(r => ({
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

    loadAll(): FunctionalUnit[] {
        return this.store.readAll<UnitRecord>().map(r => this.fromRecord(r));
    }

    delete(id: string): boolean {
        return this.store.delete(id);
    }

    private fromRecord(r: UnitRecord): FunctionalUnit {
        const unit = new FunctionalUnit(r.name, r.description, r.type, r.id);
        (unit as unknown as Record<string, unknown>)["createdAt"] = new Date(r.createdAt);
        for (const memberId of r.memberIds ?? []) {
            unit.addMember(memberId);
        }
        if (r.roles?.length) {
            unit.clearRoles();
            for (const rr of r.roles) {
                const role = new CommunityRole(rr.title, rr.description, rr.kinPerMonth);
                (role as unknown as Record<string, unknown>)["id"] = rr.id;
                role.memberId      = rr.memberId;
                role.termStartDate = rr.termStartDate ? new Date(rr.termStartDate) : null;
                role.termEndDate   = rr.termEndDate   ? new Date(rr.termEndDate)   : null;
                unit.addRole(role);
            }
        }
        return unit;
    }
}
