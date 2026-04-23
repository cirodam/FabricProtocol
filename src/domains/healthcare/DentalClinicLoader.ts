import { DentalClinic } from "./DentalClinic.js";
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

interface DentalClinicRecord {
    id: string;
    name: string;
    description: string;
    staffIds: string[];
    roles: RoleRecord[];
    createdAt: string;
}

export class DentalClinicLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(clinic: DentalClinic): void {
        const roles: RoleRecord[] = clinic.getRoles().map(r => ({
            id:              r.id,
            title:           r.title,
            description:     r.description,
            memberId:        r.memberId,
            kinPerMonth: r.kinPerMonth,
            termStartDate:   r.termStartDate?.toISOString() ?? null,
            termEndDate:     r.termEndDate?.toISOString()   ?? null,
        }));
        const record: DentalClinicRecord = {
            id:          clinic.id,
            name:        clinic.name,
            description: clinic.description,
            staffIds:    clinic.getMembers(),
            roles,
            createdAt:   clinic.createdAt.toISOString(),
        };
        this.store.write(clinic.id, record);
    }

    loadAll(): DentalClinic[] {
        return this.store.readAll<DentalClinicRecord>().map(r => this.fromRecord(r));
    }

    delete(id: string): boolean {
        return this.store.delete(id);
    }

    private fromRecord(r: DentalClinicRecord): DentalClinic {
        const clinic = new DentalClinic(r.name, r.description, r.id);
        (clinic as unknown as Record<string, unknown>)["createdAt"] = new Date(r.createdAt);
        for (const staffId of r.staffIds ?? []) {
            clinic.addMember(staffId);
        }
        for (const rr of r.roles ?? []) {
            const role = new CommunityRole(rr.title, rr.description, rr.kinPerMonth);
            (role as unknown as Record<string, unknown>)["id"] = rr.id;
            role.memberId      = rr.memberId;
            role.termStartDate = rr.termStartDate ? new Date(rr.termStartDate) : null;
            role.termEndDate   = rr.termEndDate   ? new Date(rr.termEndDate)   : null;
            clinic.addRole(role);
        }
        return clinic;
    }
}
