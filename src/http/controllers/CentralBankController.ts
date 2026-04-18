import { Request, Response } from "express";
import { CentralBank } from "../../central_bank/CentralBank.js";

const cb = () => CentralBank.getInstance();

// GET /money-supply
export function getMoneySupply(_req: Request, res: Response): void {
    const bank = cb();
    res.json({
        moneyInCirculation:  bank.moneyInCirculation,
        unrecoveredCredits:  bank.unrecoveredCredits,
    });
}
