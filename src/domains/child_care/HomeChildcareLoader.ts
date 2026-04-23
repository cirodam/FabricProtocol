import { HomeChildcare } from "./HomeChildcare.js";
import { FileStore } from "../../storage/FileStore.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

const RECORD_KEY = "instance";

interface RoleRecord {
    id: string;
    title: string;
    description: string;
    memberId: string | null;
    kinPerMonth: number;
    termStartDate: string | null;
    termEndDate: string | null;
}

interface HomeChildcareRecord {
    id: string;
    staffIds: string[];
    roles: RoleRecord[];
    createdAt: string;
}

export class HomeChildcareLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(unit: HomeChildcare): void {
        const roles: RoleRecord[] = unit.getRoles().map(r => ({
            id:              r.id,
            title:           r.title,
            description:     r.description,
            memberId:        r.memberId,
            kinPerMonth: r.kinPerMonth,
            termStartDate:   r.termStartDate?.toISOString() ?? null,
            termEndDate:     r.termEndDate?.toISOString()   ?? null,
        }));
        const record: HomeChildcareRecord = {
            id:        unit.id,
            staffIds:  unit.getMembers(),
            roles,
            createdAt: unit.createdAt.toISOString(),
        };
        this.store.write(RECORD_KEY, record);
    }

    load(): HomeChildcare | undefined {
        const r = this.store.read<HomeChildcareRecord>(RECORD_KEY);
        if (!r) return undefined;
        const unit = new HomeChildcare(r.id);
        (unit as unknown as Record<string, unknown>)["createdAt"] = new Date(r.createdAt);
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
