import { CommunityKitchen } from "./CommunityKitchen.js";
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

interface KitchenRecord {
    id: string;
    name: string;
    description: string;
    staffIds: string[];
    roles: RoleRecord[];
    createdAt: string;
}

export class CommunityKitchenLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(kitchen: CommunityKitchen): void {
        const roles: RoleRecord[] = kitchen.getRoles().map(r => ({
            id:              r.id,
            title:           r.title,
            description:     r.description,
            memberId:        r.memberId,
            kinPerMonth: r.kinPerMonth,
            termStartDate:   r.termStartDate?.toISOString() ?? null,
            termEndDate:     r.termEndDate?.toISOString()   ?? null,
        }));
        const record: KitchenRecord = {
            id:          kitchen.id,
            name:        kitchen.name,
            description: kitchen.description,
            staffIds:    kitchen.getMembers(),
            roles,
            createdAt:   kitchen.createdAt.toISOString(),
        };
        this.store.write(kitchen.id, record);
    }

    loadAll(): CommunityKitchen[] {
        return this.store.readAll<KitchenRecord>().map(r => this.fromRecord(r));
    }

    delete(id: string): boolean {
        return this.store.delete(id);
    }

    private fromRecord(r: KitchenRecord): CommunityKitchen {
        const kitchen = new CommunityKitchen(r.name, r.description, r.id);
        (kitchen as unknown as Record<string, unknown>)["createdAt"] = new Date(r.createdAt);
        for (const staffId of r.staffIds ?? []) {
            kitchen.addMember(staffId);
        }
        for (const rr of r.roles ?? []) {
            const role = new CommunityRole(rr.title, rr.description, rr.kinPerMonth);
            (role as unknown as Record<string, unknown>)["id"] = rr.id;
            role.memberId      = rr.memberId;
            role.termStartDate = rr.termStartDate ? new Date(rr.termStartDate) : null;
            role.termEndDate   = rr.termEndDate   ? new Date(rr.termEndDate)   : null;
            kitchen.addRole(role);
        }
        return kitchen;
    }
}
