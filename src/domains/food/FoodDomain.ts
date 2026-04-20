import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { Bank } from "../../bank/Bank.js";
import { MemberService } from "../../member/MemberService.js";
import { NutritionalProfile, DEFAULT_NUTRITIONAL_PROFILES, getMemberType } from "./NutritionalProfile.js";

export class FoodDomain extends FunctionalDomain {
    constructor() {
        super("Food", "Responsible for feeding all community members.");
    }

    // Top up every member's foodVoucher balance to targetAmount.
    // Only issues the difference — members who already have vouchers get less.
    // Converts the required credits from this domain's account 1:1 before distributing.
    issueMonthlyVouchers(targetAmount: number): void {
        const bankInst = Bank.getInstance();
        const domainAccount = bankInst.getPrimaryAccount(this.id);
        if (!domainAccount) return;

        const members = MemberService.getInstance().getAll();

        const gaps: Array<{ accountId: string; gap: number }> = [];
        for (const member of members) {
            const account = bankInst.getPrimaryAccount(member.getId());
            if (!account) continue;
            const gap = Math.max(0, targetAmount - account.foodVouchers);
            if (gap > 0) gaps.push({ accountId: account.id, gap });
        }

        const totalNeeded = gaps.reduce((sum, g) => sum + g.gap, 0);
        if (totalNeeded === 0) return;
        if (domainAccount.credits < totalNeeded) {
            throw new Error(`Food Provisioning has insufficient credits to issue ${totalNeeded} food vouchers`);
        }

        bankInst.convertCurrency(domainAccount.id, "credits", "foodVouchers", totalNeeded);

        for (const { accountId, gap } of gaps) {
            bankInst.transfer(domainAccount.id, accountId, "foodVouchers", gap, "monthly food voucher issuance");
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
