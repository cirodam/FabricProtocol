import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { Bank } from "../../bank/Bank.js";
import { MemberService } from "../../member/MemberService.js";
import { NutritionalProfile, DEFAULT_NUTRITIONAL_PROFILES, getMemberType } from "./NutritionalProfile.js";
import { FoodDomainLoader } from "./FoodDomainLoader.js";

export class FoodDomain extends FunctionalDomain {
    private static readonly DOMAIN_ID = "00000000-0000-0000-0000-000000000003";
    private static instance: FoodDomain;

    monthlyFoodAllowance: number = 0;
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
        const settings = loader.load();
        this.monthlyFoodAllowance = settings.monthlyFoodAllowance;
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

