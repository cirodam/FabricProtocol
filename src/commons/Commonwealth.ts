import { IEconomicActor } from "../IEconomicActor.js";
import { Bank } from "../bank/Bank.js";
import { CommunityRole } from "./CommunityRole.js";
import { FunctionalDomain } from "./domain/FunctionalDomain.js";
import { LedgerService } from "../ledger/LedgerService.js";
import { AssetLedger } from "../ledger/AssetLedger.js";
import { FoodDomain } from "../domains/food/FoodDomain.js";

// The Commons represents the community's collective investment in itself.
// It holds pooled kin used to meet basic needs, provide care for dependents,
// fund insurance, and support members who cannot fully participate in the credit system.
export class Commonwealth implements IEconomicActor {
    private static instance: Commonwealth;

    readonly id: string;

    private positions: CommunityRole[] = [];
    private domains: FunctionalDomain[] = [];
    readonly ledger: AssetLedger;

    private constructor() {
        this.id = "00000000-0000-0000-0000-000000000002"; // stable singleton ID
        if (!Bank.getInstance().getPrimaryAccount(this.id)) {
            Bank.getInstance().openAccount(this, "primary", 0, true);
        }
        this.ledger = LedgerService.getInstance().openLedger(this, "primary");
    }

    static getInstance(): Commonwealth {
        if (!Commonwealth.instance) {
        Commonwealth.instance = new Commonwealth();
        }
        return Commonwealth.instance;
    }

    getId(): string { return this.id; }
    getDisplayName(): string { return "Commons"; }
    getHandle(): string { return "commons"; }

    addPosition(position: CommunityRole): void {
        this.positions.push(position);
    }

    getPositions(): CommunityRole[] {
        return this.positions;
    }

    // Register a functional domain under this Commons.
    addDomain(domain: FunctionalDomain): void {
        this.domains.push(domain);
    }

    getDomains(): FunctionalDomain[] {
        return this.domains;
    }

    // Allocate kin from the Commons account to a domain's account.
    fundDomain(domain: FunctionalDomain, amount: number): void {
        const bankInst = Bank.getInstance();
        const from = bankInst.getPrimaryAccount(this.id);
        const to = bankInst.getPrimaryAccount(domain.id);
        if (!from) throw new Error("Commons has no primary account");
        if (!to) throw new Error(`Domain "${domain.name}" has no primary account`);
        bankInst.transfer(from.id, to.id, "kin", amount, `fund domain: ${domain.name}`);
    }

    /** Transfer all balances from every account of the given actor into the Commons. */
    collect(actor: IEconomicActor): void {
        const bankInst = Bank.getInstance();
        const commonsAccount = bankInst.getPrimaryAccount(this.id);
        if (!commonsAccount) return;
        for (const account of bankInst.getAccounts(actor.getId())) {
            if (account.kin > 0)
                bankInst.transfer(account.id, commonsAccount.id, "kin", account.kin, `collect on exit: ${actor.getDisplayName()}`);
        }
    }

    // Pay Commons-level roles, then delegate payroll to each registered domain.
    payMonthly(): void {
        const bankInst = Bank.getInstance();
        const payerAccount = bankInst.getPrimaryAccount(this.id);
        if (payerAccount) {
            for (const position of this.positions) {
                if (!position.isActive()) continue;
                const amount = Math.round(position.kinPerMonth * 100) / 100;
                if (amount <= 0) continue;
                if (payerAccount.kin < amount) {
                    console.warn(`Commons cannot afford payroll for "${position.title}" (needs ${amount}, has ${payerAccount.kin})`);
                    continue;
                }
                const memberAccount = bankInst.getPrimaryAccount(position.memberId!);
                if (!memberAccount) {
                    console.warn(`No primary account for position holder ${position.memberId} ("${position.title}")`);
                    continue;
                }
                bankInst.transfer(payerAccount.id, memberAccount.id, "kin", amount, `payroll: ${position.title}`);
            }
        }
        for (const domain of this.domains) {
            domain.payMonthly();
        }
    }

    /**
     * Returns monthly budget obligations broken down by category.
     *
     * Shape:
     *   {
     *     foodAllowance: number,     // universal member food allowance (per member × count)
     *     commons:       number,     // positions held at the Commonwealth level
     *     domains:       { name, payroll }[],
     *     total:         number
     *   }
     */
    getOutflows(): { foodAllowance: number; commons: number; domains: { name: string; payroll: number }[]; total: number } {
        const foodAllowance = FoodDomain.getInstance().monthlyAllowanceTotal();

        const commons = this.positions
            .filter(p => p.isActive())
            .reduce((sum, p) => sum + p.kinPerMonth, 0);

        const domains = this.domains.map(d => ({
            name: d.name,
            payroll: d.getPayroll(),
        }));

        const total = foodAllowance + commons + domains.reduce((sum, d) => sum + d.payroll, 0);

        return { foodAllowance, commons, domains, total };
    }

    // Collect demurrage from all non-exempt accounts into the Commons primary account.
    // Always runs — commons levy is unconditional.
    assessDemurrage(rate: number): void {
        const bankInst = Bank.getInstance();
        const commonsAccount = bankInst.getPrimaryAccount(this.id);
        if (!commonsAccount) return;

        for (const account of bankInst.getAllAccounts()) {
            if (account.exemptFromDemurrage || account.kin <= 0) continue;
            const amount = Math.round(account.kin * rate * 100) / 100;
            if (amount > 0) {
                bankInst.transfer(account.id, commonsAccount.id, "kin", amount, "demurrage: commons");
            }
        }
    }

    /** Total kin held in non-exempt accounts — the base against which the levy is applied. */
    taxableSupply(): number {
        let total = 0;
        for (const account of Bank.getInstance().getAllAccounts()) {
            if (!account.exemptFromDemurrage && account.kin > 0) total += account.kin;
        }
        return total;
    }

    /**
     * Derives the levy rate needed to exactly cover monthly outflows.
     * rate = totalOutflows / taxableSupply
     * Returns 0 if there are no outflows or no taxable balances.
     */
    computedLevyRate(): number {
        const outflows = this.getOutflows().total;
        if (outflows === 0) return 0;
        const supply = this.taxableSupply();
        if (supply === 0) return 0;
        return outflows / supply;
    }
}
