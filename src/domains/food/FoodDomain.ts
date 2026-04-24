import { FunctionalDomain, DomainBudget } from "../../commons/domain/FunctionalDomain.js";
import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";
import { FunctionalUnitLoader } from "../../commons/domain/FunctionalUnitLoader.js";
import { Bank } from "../../bank/Bank.js";
import { MemberService } from "../../member/MemberService.js";
import { NutritionalProfile, DEFAULT_NUTRITIONAL_PROFILES, getMemberType } from "./NutritionalProfile.js";
import { FoodDomainLoader } from "./FoodDomainLoader.js";
import { CommunityKitchen } from "./CommunityKitchen.js";
import { Mill } from "./Mill.js";

export class FoodDomain extends FunctionalDomain {
    private static readonly DOMAIN_ID = "00000000-0000-0000-0000-000000000003";
    private static instance: FoodDomain;

    private loader: FoodDomainLoader | null = null;

    private constructor() {
        super("Food", "Responsible for feeding all community members.", FoodDomain.DOMAIN_ID);
    }

    static getInstance(): FoodDomain {
        if (!FoodDomain.instance) {
            FoodDomain.instance = new FoodDomain();
        }
        return FoodDomain.instance;
    }

    init(loader: FoodDomainLoader): void {
        this.loader = loader;
        loader.load();
    }

    initUnits(loader: FunctionalUnitLoader): void {
        for (const unit of loader.loadAll()) {
            this.addUnit(unit);
        }
        const save = (u: FunctionalUnit) => loader.save(u);
        const del  = (id: string) => { this.removeUnit(id); loader.delete(id); };
        for (const type of ["community-kitchen", "mill", "grain-elevator"]) {
            this.registerUnitType(type, save, del);
        }
    }

    // ── Typed convenience wrappers (used by FoodController) ──────────────────

    addKitchen(kitchen: CommunityKitchen): void { this.createUnit(kitchen); }
    saveKitchen(kitchen: CommunityKitchen): void { this.saveUnit(kitchen); }
    getKitchen(id: string): CommunityKitchen | undefined {
        return this.getUnits().find(u => u.id === id && u.getType() === "community-kitchen") as CommunityKitchen | undefined;
    }
    getAllKitchens(): CommunityKitchen[] { return this.getUnitsByType<CommunityKitchen>("community-kitchen"); }
    removeKitchen(id: string): void { this.deleteUnit(id); }

    addMill(mill: Mill): void { this.createUnit(mill); }
    saveMill(mill: Mill): void { this.saveUnit(mill); }
    getMill(id: string): Mill | undefined {
        return this.getUnits().find(u => u.id === id && u.getType() === "mill") as Mill | undefined;
    }
    getAllMills(): Mill[] { return this.getUnitsByType<Mill>("mill"); }
    removeMill(id: string): void { this.deleteUnit(id); }

    getMonthlyFoodAllowance(): number {
        return this.loader?.load().monthlyFoodAllowance ?? 0;
    }

    setMonthlyFoodAllowance(value: number): void {
        const settings = this.loader?.load() ?? { monthlyFoodAllowance: 0 };
        settings.monthlyFoodAllowance = value;
        this.loader?.save(settings);
    }

    issueMonthlyKin(): void {
        const amount = this.getMonthlyFoodAllowance();
        if (amount <= 0) return;

        const bankInst = Bank.getInstance();
        const domainAccount = bankInst.getPrimaryAccount(this.id);
        if (!domainAccount) return;

        const members = MemberService.getInstance().getAll();
        const accounts = members
            .map(m => bankInst.getPrimaryAccount(m.getId()))
            .filter((a): a is NonNullable<typeof a> => a !== undefined);

        const totalNeeded = amount * accounts.length;
        if (totalNeeded === 0) return;
        if (domainAccount.kin < totalNeeded) {
            console.warn(`Food domain has insufficient kin to issue monthly allowance (needs ${totalNeeded}, has ${domainAccount.kin})`);
            return;
        }

        for (const account of accounts) {
            bankInst.transfer(domainAccount.id, account.id, "kin", amount, "monthly food allowance");
        }
    }

    monthlyAllowanceTotal(): number {
        const amount = this.getMonthlyFoodAllowance();
        const memberCount = MemberService.getInstance().getAll().length;
        return amount * memberCount;
    }

    getBudget(): DomainBudget {
        const base = super.getBudget();
        const allowance = this.monthlyAllowanceTotal();
        if (allowance > 0) {
            base.lineItems.unshift({ label: 'Food allowance (all members)', amount: allowance });
        }
        return { lineItems: base.lineItems, total: base.total + allowance };
    }

    getDailyRequirements(): NutritionalProfile {
        const totals: NutritionalProfile = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, waterL: 0 };
        for (const member of MemberService.getInstance().getAll()) {
            const profile = DEFAULT_NUTRITIONAL_PROFILES[getMemberType(member.birthDate)];
            totals.calories  += profile.calories;
            totals.proteinG  += profile.proteinG;
            totals.carbsG    += profile.carbsG;
            totals.fatG      += profile.fatG;
            totals.fiberG    += profile.fiberG;
            totals.waterL    += profile.waterL;
        }
        return totals;
    }
}


