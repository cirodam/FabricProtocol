import { randomUUID } from "crypto";
import { IAccountOwner, OwnerType } from "../bank/IAccountOwner.js";
import { Bank } from "../bank/Bank.js";
import { MemberEndowmentProfile } from "./MemberEndowmentProfile.js";
import { EndowmentProfileLoader } from "./EndowmentProfileLoader.js";

/**
 * The CentralBank is the sole issuer of currency in the community.
 * It issues a membership endowment to each member — a grant of purchasing power
 * that bootstraps their participation. Members are not expected to repay it.
 * On exit, the member's remaining balance (up to the endowment amount) is
 * returned to the bank. Any shortfall is recovered gradually via bank demurrage.
 */
export class CentralBank implements IAccountOwner {
    private static instance: CentralBank;

    /** Base endowment issued to a fully-trusted member (trustScore = 1.0). */
    static readonly BASE_ENDOWMENT = 1000;

    readonly id: string;
    readonly ownerType: OwnerType = "central_bank";

    /** One profile per member, keyed by memberId. */
    private profiles: Map<string, MemberEndowmentProfile> = new Map();
    private profileLoader: EndowmentProfileLoader | null = null;

    private constructor() {
        this.id = randomUUID();
        Bank.getInstance().openAccount(this, "primary", true, true);
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
    init(loader: EndowmentProfileLoader): void {
        this.profileLoader = loader;
        for (const profile of loader.loadAll()) {
            this.profiles.set(profile.memberId, profile);
        }
    }

    /** Returns the unique identifier for this account owner. */
    getId(): string { return this.id; }

    /** Total credits currently in circulation (sum of active endowments). */
    get moneyInCirculation(): number {
        let total = 0;
        for (const profile of this.profiles.values()) {
            if (!profile.departed) total += profile.endowment;
        }
        return total;
    }

    /** Total credits that could not be reclaimed on member exit (recovered gradually via demurrage). */
    get unrecoveredCredits(): number {
        let total = 0;
        for (const profile of this.profiles.values()) {
            total += profile.unrecoveredCredits;
        }
        return total;
    }

    /** Returns the endowment profile for a given member, or undefined if none exists. */
    getProfile(memberId: string): MemberEndowmentProfile | undefined {
        return this.profiles.get(memberId);
    }

    /**
     * Issue a membership endowment to a member.
     * This is money creation — credits are issued from nothing and added
     * directly to the member's balance. The amount may not exceed the
     * member's credit limit.
     */
    issueEndowment(member: IAccountOwner, amount: number): void {
        let profile = this.profiles.get(member.getId());
        if (!profile) {
            profile = new MemberEndowmentProfile(member.getId());
            this.profiles.set(profile.memberId, profile);
        }

        profile.endowment += amount;
        const bankAccount = Bank.getInstance().getPrimaryAccount(this.id);
        const memberAccount = Bank.getInstance().getPrimaryAccount(member.getId());
        if (!bankAccount) throw new Error("CentralBank has no primary account");
        if (!memberAccount) throw new Error(`Member ${member.getId()} has no primary account`);
        Bank.getInstance().transfer(bankAccount.id, memberAccount.id, "credits", amount, "endowment issuance");
        this.profileLoader?.save(profile);
    }

    /**
     * Reclaim a member's balance on exit (up to their endowment amount).
     * Called by MemberService.discharge(). Any surplus above the endowment
     * is handled separately by the caller (transferred to Commons).
     * Any shortfall is left as a negative bank balance, recovered via demurrage.
     */
    reclaimEndowment(member: IAccountOwner): void {
        const profile = this.profiles.get(member.getId());
        if (!profile) return;

        const bankInst = Bank.getInstance();
        const memberAccount = bankInst.getPrimaryAccount(member.getId());
        const bankAccount = bankInst.getPrimaryAccount(this.id);
        const balance = memberAccount?.credits ?? 0;
        const reclaim = Math.min(balance, profile.endowment);
        if (reclaim > 0 && memberAccount && bankAccount) {
            bankInst.transfer(memberAccount.id, bankAccount.id, "credits", reclaim, "endowment reclaim on exit");
        }
        profile.unrecoveredCredits = profile.endowment - reclaim;
        profile.departed = true;
        this.profileLoader?.save(profile);
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
