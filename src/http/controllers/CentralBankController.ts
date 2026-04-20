import { Request, Response } from "express";
import { CentralBank } from "../../central_bank/CentralBank.js";
import { MemberService } from "../../member/MemberService.js";

const cb = () => CentralBank.getInstance();

// GET /money-supply
export function getMoneySupply(_req: Request, res: Response): void {
    const bank = cb();
    res.json({
        moneyInCirculation:        bank.moneyInCirculation,
        desiredMoneyInCirculation: bank.desiredMoneyInCirculation,
        unrecoveredCredits:        bank.unrecoveredCredits,
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
