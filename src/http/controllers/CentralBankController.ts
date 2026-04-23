import { Request, Response } from "express";
import { CentralBank } from "../../central_bank/CentralBank.js";
import { Commonwealth } from "../../commons/Commonwealth.js";
import { Constitution } from "../../commons/Constitution.js";
import { MemberService } from "../../member/MemberService.js";
import { Scheduler } from "../../scheduler/Scheduler.js";
import { SocialInsuranceBank } from "../../social_insurance/SocialInsuranceBank.js";

const cb = () => CentralBank.getInstance();

// GET /money-supply
export function getMoneySupply(_req: Request, res: Response): void {
    const bank = cb();
    const retirementPool = SocialInsuranceBank.getInstance().poolBalance;
    res.json({
        moneyInCirculation:        bank.moneyInCirculation,
        desiredMoneyInCirculation: bank.desiredMoneyInCirculation,
        unrecoveredKin:            bank.unrecoveredKin,
        retirementPool,
        activeCirculation:         bank.moneyInCirculation - retirementPool,
    });
}

// GET /endowments
export function getEndowments(_req: Request, res: Response): void {
    const bank = cb();
    const memberService = MemberService.getInstance();
    const endowments = memberService.getAll().map(m => {
        const e = bank.getEndowment(m.id);
        return {
            memberId:    m.id,
            memberName:  m.getDisplayName(),
            handle:      m.handle,
            endowment:   e?.endowment ?? 0,
        };
    });
    res.json(endowments);
}

// GET /demurrage-schedule
export function getDemurrageSchedule(_req: Request, res: Response): void {
    const floor = Constitution.getInstance().demurrageFloor;
    const rate = Commonwealth.getInstance().computedLevyRate(floor);
    const info = Scheduler.getInstance()?.getJobInfo("commons-levy");
    res.json({
        rate,
        floor,
        lastRun: info?.lastRun ?? null,
        nextRun: info?.nextRun ?? null,
        intervalMs: info?.intervalMs ?? null,
    });
}
