import { FoodPurchasing } from "./FoodPurchasing.js";
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

interface FoodPurchasingRecord {
    id: string;
    name: string;
    description: string;
    staffIds: string[];
    roles: RoleRecord[];
    totalUsdSpent: number;
    createdAt: string;
}

export class FoodPurchasingLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(unit: FoodPurchasing): void {
        const roles: RoleRecord[] = unit.getRoles().map(r => ({
            id:              r.id,
            title:           r.title,
            description:     r.description,
            memberId:        r.memberId,
            creditsPerMonth: r.creditsPerMonth,
            termStartDate:   r.termStartDate?.toISOString() ?? null,
            termEndDate:     r.termEndDate?.toISOString()   ?? null,
        }));
        const record: FoodPurchasingRecord = {
            id:            unit.id,
            name:          unit.name,
            description:   unit.description,
            staffIds:      unit.getMembers(),
            roles,
            totalUsdSpent: unit.totalUsdSpent,
            createdAt:     unit.createdAt.toISOString(),
        };
        this.store.write(unit.id, record);
    }

    loadAll(): FoodPurchasing[] {
        return this.store.readAll<FoodPurchasingRecord>().map(r => this.fromRecord(r));
    }

    delete(id: string): boolean {
        return this.store.delete(id);
    }

    private fromRecord(r: FoodPurchasingRecord): FoodPurchasing {
        const unit = new FoodPurchasing(r.name, r.description);
        (unit as unknown as Record<string, unknown>)["id"]        = r.id;
        (unit as unknown as Record<string, unknown>)["createdAt"] = new Date(r.createdAt);
        unit.totalUsdSpent = r.totalUsdSpent ?? 0;
        for (const staffId of r.staffIds ?? []) {
            unit.addMember(staffId);
        }
        for (const rr of r.roles ?? []) {
            const role = new CommunityRole(rr.title, rr.description, rr.creditsPerMonth);
            (role as unknown as Record<string, unknown>)["id"] = rr.id;
            role.memberId      = rr.memberId;
            role.termStartDate = rr.termStartDate ? new Date(rr.termStartDate) : null;
            role.termEndDate   = rr.termEndDate   ? new Date(rr.termEndDate)   : null;
            unit.addRole(role);
        }
        return unit;
    }
}
