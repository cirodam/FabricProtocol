import { Request, Response } from "express";
import { Commonwealth } from "../../commons/Commonwealth.js";
import { Bank } from "../../bank/Bank.js";
import { Scheduler } from "../../scheduler/Scheduler.js";

const COMMONS_DEMURRAGE_RATE = 0.01;

// GET /commonwealth/summary
export function getSummary(_req: Request, res: Response): void {
    const commonwealth = Commonwealth.getInstance();
    const account = Bank.getInstance().getPrimaryAccount(commonwealth.id);

    res.json({
        credits: account?.credits ?? 0,
        fec:     account?.fec ?? 0,
    });
}

// GET /commonwealth/demurrage
export function getDemurrage(_req: Request, res: Response): void {
    const scheduler = Scheduler.getInstance();
    const jobInfo = scheduler?.getJobInfo("commons-levy") ?? null;

    const projectedCollection = Commonwealth.getInstance().calculateDemurrage(COMMONS_DEMURRAGE_RATE);

    res.json({
        rate:                COMMONS_DEMURRAGE_RATE,
        lastRun:             jobInfo?.lastRun ?? null,
        nextRun:             jobInfo?.nextRun ?? null,
        projectedCollection,
    });
}
