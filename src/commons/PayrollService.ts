import { Commons } from "./Commons.js";
import { Bank } from "../bank/Bank.js";
import { FunctionalDomain } from "./domain/FunctionalDomain.js";

// PayrollService pays all active, funded positions from the Commons account
// and from each registered functional domain's account.
// Call payMonthly() at the start of each month.
// The Commons must have sufficient credits; if not, payroll is skipped for that position.
export class PayrollService {
    private static instance: PayrollService;

    private constructor() {}

    static getInstance(): PayrollService {
        if (!PayrollService.instance) {
            PayrollService.instance = new PayrollService();
        }
        return PayrollService.instance;
    }

    payMonthly(): void {
        const bankInst = Bank.getInstance();
        const commons = Commons.getInstance();

        // Pay Commons-level positions (governance officers, etc.)
        this.payPositions(commons.getPositions(), commons.id, bankInst);

        // Pay positions in each registered functional domain
        for (const domain of commons.getDomains()) {
            this.payPositions(domain.getPositions(), domain.id, bankInst);
        }
    }

    private payPositions(
        positions: ReturnType<Commons["getPositions"]>,
        payerOwnerId: string,
        bankInst: Bank
    ): void {
        const payerAccount = bankInst.getPrimaryAccount(payerOwnerId);
        if (!payerAccount) return;

        for (const position of positions) {
            if (!position.isActive()) continue;

            const amount = Math.round(position.creditsPerMonth * 100) / 100;
            if (amount <= 0) continue;
            if (payerAccount.credits < amount) {
                console.warn(`Account for "${payerOwnerId}" cannot afford payroll for "${position.title}" (needs ${amount}, has ${payerAccount.credits})`);
                continue;
            }

            const memberAccount = bankInst.getPrimaryAccount(position.memberId!);
            if (!memberAccount) {
                console.warn(`No primary account for position holder ${position.memberId} ("${position.title}")`);
                continue;
            }

            bankInst.transfer(
                payerAccount.id,
                memberAccount.id,
                "credits",
                amount,
                `payroll: ${position.title}`
            );
        }
    }
}
