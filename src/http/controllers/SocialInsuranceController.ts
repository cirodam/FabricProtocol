import { Request, Response } from "express";
import { SocialInsuranceBank } from "../../social_insurance/SocialInsuranceBank.js";
import { MemberService } from "../../member/MemberService.js";
import { Constitution } from "../../commons/Constitution.js";

export function getSocialInsuranceSummary(_req: Request, res: Response): void {
    const bank = SocialInsuranceBank.getInstance();
    const constitution = Constitution.getInstance();
    const allMembers = MemberService.getInstance().getAll();

    const now = Date.now();
    const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
    const retirementAge = constitution.retirementAge;
    const payoutRate = constitution.retirementPayoutRate;

    const workingMembers = allMembers.filter(m => {
        const age = (now - m.birthDate.getTime()) / MS_PER_YEAR;
        return age < retirementAge;
    });
    const retiredMembers = allMembers.filter(m => m.retired);

    const poolBalance = bank.poolBalance;
    const monthlyInflow = Math.round((allMembers.length * 10_000) / 12);
    const monthlyOutflow = Math.round(poolBalance * payoutRate);
    const perRetireeMonthly = retiredMembers.length > 0
        ? Math.floor(Math.floor(poolBalance * payoutRate) / retiredMembers.length)
        : 0;

    res.json({
        poolBalance,
        retirementAge,
        payoutRate,
        totalMembers: allMembers.length,
        workingMembers: workingMembers.length,
        retiredMembers: retiredMembers.length,
        monthlyInflow,
        monthlyOutflow,
        netMonthlyFlow: monthlyInflow - monthlyOutflow,
        perRetireeMonthly,
    });
}
