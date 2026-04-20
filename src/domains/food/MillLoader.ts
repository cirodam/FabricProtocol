import { Mill } from "./Mill.js";
import { FileStore } from "../../storage/FileStore.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

interface RoleRecord {
    id: string;
    title: string;
    description: string;
    memberId: string | null;
    creditsPerMonth: number;
    termStartDate: string | null;
    termEndDate: string | null;
}

interface MillRecord {
    id: string;
    name: string;
    description: string;
    staffIds: string[];
    roles: RoleRecord[];
    createdAt: string;
}

export class MillLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(mill: Mill): void {
        const roles: RoleRecord[] = mill.getRoles().map(r => ({
            id:              r.id,
            title:           r.title,
            description:     r.description,
            memberId:        r.memberId,
            creditsPerMonth: r.creditsPerMonth,
            termStartDate:   r.termStartDate?.toISOString() ?? null,
            termEndDate:     r.termEndDate?.toISOString()   ?? null,
        }));
        const record: MillRecord = {
            id:          mill.id,
            name:        mill.name,
            description: mill.description,
            staffIds:    mill.getMembers(),
            roles,
            createdAt:   mill.createdAt.toISOString(),
        };
        this.store.write(mill.id, record);
    }

    loadAll(): Mill[] {
        return this.store.readAll<MillRecord>().map(r => this.fromRecord(r));
    }

    delete(id: string): boolean {
        return this.store.delete(id);
    }

    private fromRecord(r: MillRecord): Mill {
        const mill = new Mill(r.name, r.description);
        (mill as unknown as Record<string, unknown>)["id"]        = r.id;
        (mill as unknown as Record<string, unknown>)["createdAt"] = new Date(r.createdAt);
        for (const staffId of r.staffIds ?? []) {
            mill.addMember(staffId);
        }
        for (const rr of r.roles ?? []) {
            const role = new CommunityRole(rr.title, rr.description, rr.creditsPerMonth);
            (role as unknown as Record<string, unknown>)["id"] = rr.id;
            role.memberId      = rr.memberId;
            role.termStartDate = rr.termStartDate ? new Date(rr.termStartDate) : null;
            role.termEndDate   = rr.termEndDate   ? new Date(rr.termEndDate)   : null;
            mill.addRole(role);
        }
        return mill;
    }
}
