import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { HousingUnit } from "./HousingUnit.js";
import { HousingUnitLoader } from "./HousingUnitLoader.js";
import { MemberService } from "../../member/MemberService.js";

export class HousingDomain extends FunctionalDomain {
    private static instance: HousingDomain;
    private housingUnits: Map<string, HousingUnit> = new Map();
    private loader: HousingUnitLoader | null = null;

    constructor() {
        super("Housing", "Manages community housing stock and member accommodation.");
    }

    static getInstance(): HousingDomain {
        if (!HousingDomain.instance) {
            HousingDomain.instance = new HousingDomain();
        }
        return HousingDomain.instance;
    }

    init(loader: HousingUnitLoader): void {
        this.loader = loader;
        for (const unit of loader.loadAll()) {
            this.housingUnits.set(unit.id, unit);
        }
    }

    add(unit: HousingUnit): void {
        this.housingUnits.set(unit.id, unit);
        this.loader?.save(unit);
    }

    get(id: string): HousingUnit | undefined {
        return this.housingUnits.get(id);
    }

    remove(id: string): void {
        this.housingUnits.delete(id);
        this.loader?.delete(id);
    }

    getAll(): HousingUnit[] {
        return Array.from(this.housingUnits.values());
    }

    findByMember(memberId: string): HousingUnit | undefined {
        return Array.from(this.housingUnits.values()).find((u) =>
            u.getMembers().includes(memberId)
        );
    }

    findByOwner(ownerId: string): HousingUnit[] {
        return Array.from(this.housingUnits.values()).filter((u) => u.ownerId === ownerId);
    }

    findUnhoused(): string[] {
        const housed = new Set(
            Array.from(this.housingUnits.values()).flatMap((u) => u.getMembers())
        );
        return MemberService.getInstance().getAll()
            .map((m) => m.getId())
            .filter((id) => !housed.has(id));
    }

    count(): number {
        return this.housingUnits.size;
    }
}
