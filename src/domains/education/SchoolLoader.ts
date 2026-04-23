import { School } from "./School.js";
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

interface SchoolRecord {
    id: string;
    name: string;
    description: string;
    staffIds: string[];
    roles: RoleRecord[];
    createdAt: string;
}

export class SchoolLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(school: School): void {
        const roles: RoleRecord[] = school.getRoles().map(r => ({
            id:              r.id,
            title:           r.title,
            description:     r.description,
            memberId:        r.memberId,
            kinPerMonth: r.kinPerMonth,
            termStartDate:   r.termStartDate?.toISOString() ?? null,
            termEndDate:     r.termEndDate?.toISOString()   ?? null,
        }));
        const record: SchoolRecord = {
            id:          school.id,
            name:        school.name,
            description: school.description,
            staffIds:    school.getMembers(),
            roles,
            createdAt:   school.createdAt.toISOString(),
        };
        this.store.write(school.id, record);
    }

    loadAll(): School[] {
        return this.store.readAll<SchoolRecord>().map(r => this.fromRecord(r));
    }

    delete(id: string): boolean {
        return this.store.delete(id);
    }

    private fromRecord(r: SchoolRecord): School {
        const school = new School(r.name, r.description, r.id);
        (school as unknown as Record<string, unknown>)["createdAt"] = new Date(r.createdAt);
        for (const staffId of r.staffIds ?? []) {
            school.addMember(staffId);
        }
        for (const rr of r.roles ?? []) {
            const role = new CommunityRole(rr.title, rr.description, rr.kinPerMonth);
            (role as unknown as Record<string, unknown>)["id"] = rr.id;
            role.memberId      = rr.memberId;
            role.termStartDate = rr.termStartDate ? new Date(rr.termStartDate) : null;
            role.termEndDate   = rr.termEndDate   ? new Date(rr.termEndDate)   : null;
            school.addRole(role);
        }
        return school;
    }
}
