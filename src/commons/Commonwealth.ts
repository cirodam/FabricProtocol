import { IEconomicActor } from "../IEconomicActor.js";
import { Bank } from "../bank/Bank.js";
import { CommunityRole } from "./CommunityRole.js";
import { FunctionalDomain, BudgetLineItem } from "./domain/FunctionalDomain.js";
import { Constitution } from "./Constitution.js";

// The Commons represents the community's collective investment in itself.
// It holds pooled kin used to meet basic needs, provide care for dependents,
// fund insurance, and support members who cannot fully participate in the credit system.
export class Commonwealth implements IEconomicActor {
    private static instance: Commonwealth;

    readonly id: string;

    private positions: CommunityRole[] = [];
    private domains: FunctionalDomain[] = [];

    private constructor() {
        this.id = "00000000-0000-0000-0000-000000000002"; // stable singleton ID
        if (!Bank.getInstance().getPrimaryAccount(this.id)) {
            Bank.getInstance().openAccount(this, "primary", 0, true);
        }
    }

    static getInstance(): Commonwealth {
        if (!Commonwealth.instance) {
        Commonwealth.instance = new Commonwealth();
        }
        return Commonwealth.instance;
    }

    getId(): string { return this.id; }
    getDisplayName(): string { return Constitution.getInstance().communityName; }
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
     * Returns monthly budget obligations broken down by domain.
     *
     * Shape:
     *   {
     *     commons:  { lineItems: BudgetLineItem[]; total: number },
     *     domains:  { name: string; lineItems: BudgetLineItem[]; total: number }[],
     *     total:    number
     *   }
     */
    getOutflows(): {
        commons: { lineItems: BudgetLineItem[]; total: number };
        domains: { name: string; handle: string; lineItems: BudgetLineItem[]; total: number }[];
        total: number;
    } {
        const commonsLineItems: BudgetLineItem[] = this.positions
            .filter(p => p.isActive())
            .map(p => ({ label: p.title, amount: p.kinPerMonth }));
        const commonsTotal = commonsLineItems.reduce((sum, i) => sum + i.amount, 0);

        const domains = this.domains.map(d => {
            const budget = d.getBudget();
            return { name: d.getDisplayName(), handle: d.getHandle(), lineItems: budget.lineItems, total: budget.total };
        });

        const total = commonsTotal + domains.reduce((sum, d) => sum + d.total, 0);
        return { commons: { lineItems: commonsLineItems, total: commonsTotal }, domains, total };
    }

    // Collect demurrage from all non-exempt accounts into the Commons primary account.
    // Only the portion of each balance above `floor` is taxable.
    // Always runs — commons levy is unconditional.
    assessDemurrage(rate: number, floor: number = 0): void {
        const bankInst = Bank.getInstance();
        const commonsAccount = bankInst.getPrimaryAccount(this.id);
        if (!commonsAccount) return;

        for (const account of bankInst.getAllAccounts()) {
            if (account.exemptFromDemurrage || account.kin <= 0) continue;
            const taxable = Math.max(0, account.kin - floor);
            const amount = Math.round(taxable * rate * 100) / 100;
            if (amount > 0) {
                bankInst.transfer(account.id, commonsAccount.id, "kin", amount, "demurrage: community");
            }
        }
    }

    /**
     * Total kin above the floor in non-exempt accounts — the actual tax base for the levy.
     * floor defaults to 0 (full balance is taxable, matching the old behaviour).
     */
    taxableSupply(floor: number = 0): number {
        let total = 0;
        for (const account of Bank.getInstance().getAllAccounts()) {
            if (!account.exemptFromDemurrage && account.kin > 0)
                total += Math.max(0, account.kin - floor);
        }
        return total;
    }

    /**
     * Derives the levy rate needed to cover monthly outflows plus an optional
     * savings target (e.g. the community budget). The savings target is treated
     * as additional dues — no new money is created.
     * rate = (outflows + savingsTarget) / taxableSupply(floor)
     * Returns 0 if there is nothing to collect or no taxable balances.
     */
    computedLevyRate(floor: number = 0, savingsTarget: number = 0): number {
        const outflows = this.getOutflows().total;
        const target = outflows + savingsTarget;
        if (target === 0) return 0;
        const supply = this.taxableSupply(floor);
        if (supply === 0) return 0;
        return target / supply;
    }
}
