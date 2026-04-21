import { MedicalCareUnit } from "./MedicalCareUnit.js";
import { FileStore } from "../../storage/FileStore.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

interface RoleRecord {
    id: string;
    title: string;
    description: string;
    memberId: string | null;
    kinPerMonth: number;
    termStartDate: string | null;
    termEndDate: string | null;
}

interface MedicalCareUnitRecord {
    id: string;
    name: string;
    description: string;
    staffIds: string[];
    roles: RoleRecord[];
    createdAt: string;
}

export class MedicalCareUnitLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(unit: MedicalCareUnit): void {
        const roles: RoleRecord[] = unit.getRoles().map(r => ({
            id:              r.id,
            title:           r.title,
            description:     r.description,
            memberId:        r.memberId,
            kinPerMonth: r.kinPerMonth,
            termStartDate:   r.termStartDate?.toISOString() ?? null,
            termEndDate:     r.termEndDate?.toISOString()   ?? null,
        }));
        const record: MedicalCareUnitRecord = {
            id:          unit.id,
            name:        unit.name,
            description: unit.description,
            staffIds:    unit.getMembers(),
            roles,
            createdAt:   unit.createdAt.toISOString(),
        };
        this.store.write(unit.id, record);
    }

    loadAll(): MedicalCareUnit[] {
        return this.store.readAll<MedicalCareUnitRecord>().map(r => this.fromRecord(r));
    }

    delete(id: string): boolean {
        return this.store.delete(id);
    }

    private fromRecord(r: MedicalCareUnitRecord): MedicalCareUnit {
        const unit = new MedicalCareUnit(r.name);
        (unit as unknown as Record<string, unknown>)["id"]          = r.id;
        (unit as unknown as Record<string, unknown>)["description"] = r.description;
        (unit as unknown as Record<string, unknown>)["createdAt"]   = new Date(r.createdAt);
        for (const staffId of r.staffIds ?? []) {
            unit.addMember(staffId);
        }
        for (const rr of r.roles ?? []) {
            const role = new CommunityRole(rr.title, rr.description, rr.kinPerMonth);
            (role as unknown as Record<string, unknown>)["id"] = rr.id;
            role.memberId      = rr.memberId;
            role.termStartDate = rr.termStartDate ? new Date(rr.termStartDate) : null;
            role.termEndDate   = rr.termEndDate   ? new Date(rr.termEndDate)   : null;
            unit.addRole(role);
        }
        return unit;
    }
}
