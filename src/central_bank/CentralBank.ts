import { IEconomicActor } from "../IEconomicActor.js";
import { Bank } from "../bank/Bank.js";
import { MemberEndowment } from "./MemberEndowment.js";
import { MemberEndowmentLoader } from "./MemberEndowmentLoader.js";

/**
 * The CentralBank is the sole issuer of currency in the community.
 * It issues a membership endowment to each member — a grant of purchasing power
 * that bootstraps their participation. Members are not expected to repay it.
 * On exit, the member's remaining balance (up to the endowment amount) is
 * returned to the bank. Any shortfall is recovered gradually via bank demurrage.
 */
export class CentralBank implements IEconomicActor {
    private static instance: CentralBank;

    /** Base endowment issued to a fully-trusted member (trustScore = 1.0). */
    static readonly BASE_ENDOWMENT = 1000;

    readonly id: string;

    /** One endowment record per member, keyed by memberId. */
    private endowments: Map<string, MemberEndowment> = new Map();
    private endowmentLoader: MemberEndowmentLoader | null = null;

    private constructor() {
        this.id = "00000000-0000-0000-0000-000000000001"; // stable singleton ID
        if (!Bank.getInstance().getPrimaryAccount(this.id)) {
            Bank.getInstance().openAccount(this, "primary", true, true);
        }
    }

    static getInstance(): CentralBank {
        if (!CentralBank.instance) {
        CentralBank.instance = new CentralBank();
        }
        return CentralBank.instance;
    }

    /**
     * Set the persistence layer and load all endowment profiles from disk.
     * Call once at app startup before any other operations.
     */
    init(loader: MemberEndowmentLoader): void {
        this.endowmentLoader = loader;
        for (const e of loader.loadAll()) {
            this.endowments.set(e.memberId, e);
        }
    }

    /** Returns the unique identifier for this account owner. */
    getId(): string { return this.id; }
    getDisplayName(): string { return "Central Bank"; }
    getHandle(): string { return "central_bank"; }

    /** Total credits actually in circulation (magnitude of the bank's negative balance). */
    get moneyInCirculation(): number {
        const bankAccount = Bank.getInstance().getPrimaryAccount(this.id);
        return Math.max(0, -(bankAccount?.credits ?? 0));
    }

    /** What money in circulation should be — sum of all active member endowments. */
    get desiredMoneyInCirculation(): number {
        let total = 0;
        for (const e of this.endowments.values()) total += e.endowment;
        return total;
    }

    /** Credits still floating from departed members we couldn't fully reclaim. */
    get unrecoveredCredits(): number {
        return Math.max(0, this.moneyInCirculation - this.desiredMoneyInCirculation);
    }

    /** Returns the endowment record for a given member, or undefined if none exists. */
    getEndowment(memberId: string): MemberEndowment | undefined {
        return this.endowments.get(memberId);
    }

    /**
     * Issue a membership endowment to a member.
     * Credits are transferred from the CentralBank account (which goes negative)
     * directly to the member's primary account.
     */
    issueEndowment(member: IEconomicActor, amount: number): void {
        let e = this.endowments.get(member.getId());
        if (!e) {
            e = new MemberEndowment(member.getId());
            this.endowments.set(e.memberId, e);
        }

        e.endowment += amount;
        const bankAccount = Bank.getInstance().getPrimaryAccount(this.id);
        const memberAccount = Bank.getInstance().getPrimaryAccount(member.getId());
        if (!bankAccount) throw new Error("CentralBank has no primary account");
        if (!memberAccount) throw new Error(`Member ${member.getId()} has no primary account`);
        Bank.getInstance().transfer(bankAccount.id, memberAccount.id, "credits", amount, "endowment issuance");
        this.endowmentLoader?.save(e);
    }

    /**
     * Reclaim a departing member's balance (up to their endowment amount).
     * Any shortfall remains as a negative balance on the bank account and is
     * recovered gradually through demurrage.
     */
    reclaimEndowment(member: IEconomicActor): void {
        const e = this.endowments.get(member.getId());
        if (!e) return;

        const bankInst = Bank.getInstance();
        const bankAccount = bankInst.getPrimaryAccount(this.id);
        if (!bankAccount) return;

        let remaining = e.endowment;
        for (const account of bankInst.getAccounts(member.getId())) {
            if (remaining <= 0) break;
            const take = Math.min(account.credits, remaining);
            if (take > 0) {
                bankInst.transfer(account.id, bankAccount.id, "credits", take, "endowment reclaim on exit");
                remaining -= take;
            }
        }
        this.endowments.delete(member.getId());
        this.endowmentLoader?.delete(member.getId());
    }

    /**
     * Calculate what demurrage would collect at the given rate without applying it.
     * Returns the total amount that would be collected across all non-exempt accounts.
     */
    calculateDemurrage(rate: number): number {
        if (this.moneyInCirculation <= 0) return 0;
        let total = 0;
        for (const account of Bank.getInstance().getAllAccounts()) {
            if (account.exemptFromDemurrage || account.credits <= 0) continue;
            total += Math.round(account.credits * rate * 100) / 100;
        }
        return total;
    }

    /**
     * Collect demurrage from all non-exempt accounts and return it to the bank.
     * Demurrage is assessed as a percentage of each account's current balance.
     * Only runs when money is in circulation (i.e. the bank account is negative).
     * This is the mechanism by which the money supply gradually contracts after
     * member exits result in shortfalls.
     */
    assessDemurrage(rate: number): void {
        if (this.moneyInCirculation <= 0) return;

        const bankInst = Bank.getInstance();
        const bankAccount = bankInst.getPrimaryAccount(this.id);
        if (!bankAccount) return;

        for (const account of bankInst.getAllAccounts()) {
            if (account.exemptFromDemurrage || account.credits <= 0) continue;
            const amount = Math.round(account.credits * rate * 100) / 100;
            if (amount > 0) {
                bankInst.transfer(account.id, bankAccount.id, "credits", amount, "demurrage: bank recovery");
            }
        }
    }
}
