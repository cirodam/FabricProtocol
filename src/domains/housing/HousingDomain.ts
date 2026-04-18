import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { HousingUnit } from "./HousingUnit.js";
import { MemberService } from "../../member/MemberService.js";

export class HousingDomain extends FunctionalDomain {
    private housingUnits: Map<string, HousingUnit> = new Map();

    constructor() {
        super("Housing", "Manages community housing stock and member accommodation.");
    }

    add(unit: HousingUnit): void {
        this.housingUnits.set(unit.id, unit);
    }

    get(id: string): HousingUnit | undefined {
        return this.housingUnits.get(id);
    }

    remove(id: string): void {
        this.housingUnits.delete(id);
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
