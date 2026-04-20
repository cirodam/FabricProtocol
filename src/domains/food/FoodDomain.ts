import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { Bank } from "../../bank/Bank.js";
import { MemberService } from "../../member/MemberService.js";
import { NutritionalProfile, DEFAULT_NUTRITIONAL_PROFILES, getMemberType } from "./NutritionalProfile.js";
import { FoodDomainLoader } from "./FoodDomainLoader.js";
import { CommunityKitchen } from "./CommunityKitchen.js";
import { CommunityKitchenLoader } from "./CommunityKitchenLoader.js";
import { Mill } from "./Mill.js";
import { MillLoader } from "./MillLoader.js";
import { FoodPurchasing } from "./FoodPurchasing.js";
import { FoodPurchasingLoader } from "./FoodPurchasingLoader.js";

export class FoodDomain extends FunctionalDomain {
    private static readonly DOMAIN_ID = "00000000-0000-0000-0000-000000000003";
    private static instance: FoodDomain;

    monthlyFoodAllowance: number = 0;
    private loader: FoodDomainLoader | null = null;
    private kitchenLoader: CommunityKitchenLoader | null = null;
    private millLoader: MillLoader | null = null;
    private foodPurchasingLoader: FoodPurchasingLoader | null = null;

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
        const settings = loader.load();
        this.monthlyFoodAllowance = settings.monthlyFoodAllowance;
    }

    initKitchens(loader: CommunityKitchenLoader): void {
        this.kitchenLoader = loader;
        for (const kitchen of loader.loadAll()) {
            this.addUnit(kitchen);
        }
    }

    addKitchen(kitchen: CommunityKitchen): void {
        this.addUnit(kitchen);
        this.kitchenLoader?.save(kitchen);
    }

    saveKitchen(kitchen: CommunityKitchen): void {
        this.kitchenLoader?.save(kitchen);
    }

    getKitchen(id: string): CommunityKitchen | undefined {
        return this.getUnits().find(u => u.id === id) as CommunityKitchen | undefined;
    }

    getAllKitchens(): CommunityKitchen[] {
        return this.getUnitsByType<CommunityKitchen>("community-kitchen");
    }

    removeKitchen(id: string): void {
        this.removeUnit(id);
        this.kitchenLoader?.delete(id);
    }

    initMills(loader: MillLoader): void {
        this.millLoader = loader;
        for (const mill of loader.loadAll()) {
            this.addUnit(mill);
        }
    }

    addMill(mill: Mill): void {
        this.addUnit(mill);
        this.millLoader?.save(mill);
    }

    saveMill(mill: Mill): void {
        this.millLoader?.save(mill);
    }

    getMill(id: string): Mill | undefined {
        return this.getUnits().find(u => u.id === id) as Mill | undefined;
    }

    getAllMills(): Mill[] {
        return this.getUnitsByType<Mill>("mill");
    }

    removeMill(id: string): void {
        this.removeUnit(id);
        this.millLoader?.delete(id);
    }

    initFoodPurchasing(loader: FoodPurchasingLoader): void {
        this.foodPurchasingLoader = loader;
        for (const unit of loader.loadAll()) {
            this.addUnit(unit);
        }
    }

    addFoodPurchasing(unit: FoodPurchasing): void {
        this.addUnit(unit);
        this.foodPurchasingLoader?.save(unit);
    }

    saveFoodPurchasing(unit: FoodPurchasing): void {
        this.foodPurchasingLoader?.save(unit);
    }

    getFoodPurchasing(id: string): FoodPurchasing | undefined {
        return this.getUnits().find(u => u.id === id) as FoodPurchasing | undefined;
    }

    getAllFoodPurchasing(): FoodPurchasing[] {
        return this.getUnitsByType<FoodPurchasing>("food-purchasing");
    }

    removeFoodPurchasing(id: string): void {
        this.removeUnit(id);
        this.foodPurchasingLoader?.delete(id);
    }

    setMonthlyAllowance(amount: number): void {
        this.monthlyFoodAllowance = amount;
        this.loader?.save({ monthlyFoodAllowance: amount });
    }

    // Issue the monthly food credit allowance to every member.
    // Transfers credits from this domain's account to each member's primary account.
    issueMonthlyCredits(): void {
        const amount = this.monthlyFoodAllowance;
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
        if (domainAccount.credits < totalNeeded) {
            console.warn(`Food domain has insufficient credits to issue monthly allowance (needs ${totalNeeded}, has ${domainAccount.credits})`);
            return;
        }

        for (const account of accounts) {
            bankInst.transfer(domainAccount.id, account.id, "credits", amount, "monthly food allowance");
        }
    }

    // Sum the daily nutritional requirements across all current community members.
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

