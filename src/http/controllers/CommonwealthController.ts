import { Request, Response } from "express";
import { Commonwealth } from "../../commons/Commonwealth.js";
import { Bank } from "../../bank/Bank.js";
import { Scheduler } from "../../scheduler/Scheduler.js";

const cw = () => Commonwealth.getInstance();

// GET /commonwealth/summary
export function getSummary(_req: Request, res: Response): void {
    const commonwealth = cw();
    const account = Bank.getInstance().getPrimaryAccount(commonwealth.id);

    res.json({
        kin: account?.kin ?? 0,
    });
}

// GET /community/demurrage
export function getDemurrage(_req: Request, res: Response): void {
    const commonwealth = cw();
    const scheduler = Scheduler.getInstance();
    const jobInfo = scheduler?.getJobInfo("commons-levy") ?? null;

    const rate = commonwealth.computedLevyRate();
    const taxableSupply = commonwealth.taxableSupply();

    res.json({
        rate,
        taxableSupply,
        projectedCollection: commonwealth.getOutflows().total,
        lastRun: jobInfo?.lastRun ?? null,
        nextRun: jobInfo?.nextRun ?? null,
    });
}

// GET /community/outflows
export function getOutflows(_req: Request, res: Response): void {
    const payroll = cw().getOutflows();
    res.json({ payroll });
}
