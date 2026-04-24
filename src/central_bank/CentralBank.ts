import { IEconomicActor } from "../IEconomicActor.js";
import { Bank } from "../bank/Bank.js";
import { MemberEndowment } from "./MemberEndowment.js";
import { MemberEndowmentLoader } from "./MemberEndowmentLoader.js";
import { Constitution } from "../commons/Constitution.js";
import { Commonwealth } from "../commons/Commonwealth.js";
import { Member } from "../member/Member.js";
import { SocialInsuranceBank } from "../social_insurance/SocialInsuranceBank.js";

/**
 * The CentralBank is the sole issuer of currency in the community.
 * It issues a membership endowment to each member — a grant of purchasing power
 * that bootstraps their participation. Members are not expected to repay it.
 * On exit, the member's remaining balance (up to the endowment amount) is
 * returned to the bank. Any shortfall is recovered gradually via bank demurrage.
 */
export class CentralBank implements IEconomicActor {
    private static instance: CentralBank;

    /** Kin issued per person-year (on joining and each anniversary). */
    static readonly KIN_PER_PERSON_YEAR = 10_000;

    readonly id: string;

    /** The rate used for periodic bank demurrage. Set at startup by index.ts. */
    demurrageRate: number = 0;

    /** One endowment record per member, keyed by memberId. */
    private endowments: Map<string, MemberEndowment> = new Map();
    private endowmentLoader: MemberEndowmentLoader | null = null;

    /**
     * Total kin minted into the retirement pool (net of burns).
     * Included in desiredMoneyInCirculation so the demurrage safety-net
     * correctly treats pool-backed kin as legitimately issued.
     */
    private poolIssued: number = 0;

    /**
     * Aggregate community endowment: 50,000 kin per current member.
     * Rises on join, falls on departure. Included in desiredMoneyInCirculation
     * so the money supply tracks population automatically.
     */
    private communityEndowmentTotal: number = 0;

    private constructor() {
        this.id = "00000000-0000-0000-0000-000000000001"; // stable singleton ID
        if (!Bank.getInstance().getPrimaryAccount(this.id)) {
            Bank.getInstance().openAccount(this, "primary", -Infinity, true);
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

    /** Total kin actually in circulation (magnitude of the bank's negative balance). */
    get moneyInCirculation(): number {
        const bankAccount = Bank.getInstance().getPrimaryAccount(this.id);
        return Math.max(0, -(bankAccount?.kin ?? 0));
    }

    /** What money in circulation should be — sum of all active member endowments, pool-backed kin, and community endowment. */
    get desiredMoneyInCirculation(): number {
        let total = 0;
        for (const e of this.endowments.values()) total += e.endowment;
        return total + this.poolIssued + this.communityEndowmentTotal;
    }

    /** Kin still floating from departed members we couldn't fully reclaim. */
    get unrecoveredKin(): number {
        return Math.max(0, this.moneyInCirculation - this.desiredMoneyInCirculation);
    }

    /**
     * Issue the community endowment for a new member.
     * Mints `amount` kin: memberShare (1,000) → member's primary account,
     * remainder → Commonwealth primary account.
     * communityEndowmentTotal rises by `amount`.
     */
    issueCommunityEndowment(
        member: IEconomicActor,
        commonwealth: IEconomicActor,
        amount: number,
        memberShare: number,
    ): void {
        // Idempotent — skip if already issued for this member.
        let e = this.endowments.get(member.getId());
        if (e?.communityEndowmentIssued) {
            this.communityEndowmentTotal += amount; // restore total from persisted records at startup
            return;
        }
        const bankInst = Bank.getInstance();
        const bankAccount = bankInst.getPrimaryAccount(this.id);
        const memberAccount = bankInst.getPrimaryAccount(member.getId());
        const cwAccount = bankInst.getPrimaryAccount(commonwealth.getId());
        if (!bankAccount)  throw new Error("CentralBank has no primary account");
        if (!memberAccount) throw new Error(`Member ${member.getId()} has no primary account`);
        if (!cwAccount)    throw new Error("Commonwealth has no primary account");
        const cwShare = amount - memberShare;
        if (memberShare > 0)
            bankInst.transfer(bankAccount.id, memberAccount.id, "kin", memberShare, "community endowment: member share");
        if (cwShare > 0)
            bankInst.transfer(bankAccount.id, cwAccount.id, "kin", cwShare, "community endowment: commonwealth share");
        this.communityEndowmentTotal += amount;
        if (!e) {
            e = new MemberEndowment(member.getId());
            this.endowments.set(e.memberId, e);
        }
        e.communityEndowmentIssued = true;
        this.endowmentLoader?.save(e);
    }

    /**
     * Reclaim the community endowment for a departing member.
     * Attempts to burn `amount` kin from the member's and commonwealth's accounts.
     * Any unrecoverable portion (already spent/demurraged) is left as a
     * temporary overshoot that demurrage will absorb naturally.
     * communityEndowmentTotal falls by `amount` regardless.
     */
    reclaimCommunityEndowment(
        member: IEconomicActor,
        commonwealth: IEconomicActor,
        amount: number,
        memberShare: number,
    ): void {
        const bankInst = Bank.getInstance();
        const bankAccount = bankInst.getPrimaryAccount(this.id);
        if (!bankAccount) return;
        let remaining = amount;
        // Reclaim from member first
        for (const account of bankInst.getAccounts(member.getId())) {
            if (remaining <= 0) break;
            const take = Math.min(account.kin, remaining);
            if (take > 0) {
                bankInst.transfer(account.id, bankAccount.id, "kin", take, "community endowment reclaim: member");
                remaining -= take;
            }
        }
        // Reclaim remainder from Commonwealth (up to cwShare)
        const cwShare = amount - memberShare;
        const cwReclaim = Math.min(cwShare, remaining);
        if (cwReclaim > 0) {
            const cwAccount = bankInst.getPrimaryAccount(commonwealth.getId());
            if (cwAccount) {
                const take = Math.min(cwAccount.kin, cwReclaim);
                if (take > 0)
                    bankInst.transfer(cwAccount.id, bankAccount.id, "kin", take, "community endowment reclaim: commonwealth");
            }
        }
        this.communityEndowmentTotal = Math.max(0, this.communityEndowmentTotal - amount);
    }

    /**
     * Restore poolIssued from persisted SocialInsuranceBank records at startup.
     * Must be called after SocialInsuranceBank.init().
     */
    restorePoolIssued(total: number): void {
        this.poolIssued = total;
    }

    /**
     * Mint kin into the retirement pool account.
     * Called by SocialInsuranceBank for birthday and join contributions.
     */
    mintToPool(targetAccountId: string, amount: number, description: string): void {
        const bankInst = Bank.getInstance();
        const bankAccount = bankInst.getPrimaryAccount(this.id);
        const poolAccount = bankInst.getAccount(targetAccountId);
        if (!bankAccount) throw new Error("CentralBank has no primary account");
        if (!poolAccount) throw new Error(`Pool account ${targetAccountId} not found`);
        bankInst.transfer(bankAccount.id, poolAccount.id, "kin", amount, description);
        this.poolIssued += amount;
    }

    /**
     * Burn kin from the retirement pool back to the bank (contraction).
     * Called by SocialInsuranceBank on member death to cancel their unspent entitlement.
     */
    burnFromPool(sourceAccountId: string, amount: number, description: string): void {
        const bankInst = Bank.getInstance();
        const bankAccount = bankInst.getPrimaryAccount(this.id);
        const poolAccount = bankInst.getAccount(sourceAccountId);
        if (!bankAccount) throw new Error("CentralBank has no primary account");
        if (!poolAccount) throw new Error(`Pool account ${sourceAccountId} not found`);
        bankInst.transfer(poolAccount.id, bankAccount.id, "kin", amount, description);
        this.poolIssued = Math.max(0, this.poolIssued - amount);
    }

    /** Returns the endowment record for a given member, or undefined if none exists. */
    getEndowment(memberId: string): MemberEndowment | undefined {
        return this.endowments.get(memberId);
    }

    /**
     * Issue a membership endowment to a member.
     * Kin are transferred from the CentralBank account (which goes negative)
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
        Bank.getInstance().transfer(bankAccount.id, memberAccount.id, "kin", amount, "endowment issuance");
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
            const take = Math.min(account.kin, remaining);
            if (take > 0) {
                bankInst.transfer(account.id, bankAccount.id, "kin", take, "endowment reclaim on exit");
                remaining -= take;
            }
        }
        this.endowments.delete(member.getId());
        this.endowmentLoader?.delete(member.getId());
    }

    /**
     * Calculate what demurrage would collect at the given rate without applying it.
     * Only the portion of each balance above `floor` is taxable.
     * Returns the total amount that would be collected across all non-exempt accounts.
     */
    calculateDemurrage(rate: number, floor: number = 0): number {
        if (this.moneyInCirculation <= 0) return 0;
        let total = 0;
        for (const account of Bank.getInstance().getAllAccounts()) {
            if (account.exemptFromDemurrage || account.kin <= 0) continue;
            const taxable = Math.max(0, account.kin - floor);
            total += Math.round(taxable * rate * 100) / 100;
        }
        return total;
    }

    /**
     * Collect demurrage from all non-exempt accounts and return it to the bank.
     * Only the portion of each balance above `floor` is subject to demurrage.
     * Only runs when money is in circulation (i.e. the bank account is negative).
     * This is the mechanism by which the money supply gradually contracts after
     * member exits result in shortfalls.
     */
    assessDemurrage(rate: number, floor: number = 0): void {
        if (this.moneyInCirculation <= 0) return;

        const bankInst = Bank.getInstance();
        const bankAccount = bankInst.getPrimaryAccount(this.id);
        if (!bankAccount) return;

        for (const account of bankInst.getAllAccounts()) {
            if (account.exemptFromDemurrage || account.kin <= 0) continue;
            const taxable = Math.max(0, account.kin - floor);
            const amount = Math.round(taxable * rate * 100) / 100;
            if (amount > 0) {
                bankInst.transfer(account.id, bankAccount.id, "kin", amount, "demurrage: bank recovery");
            }
        }
    }

    // ── Event handlers ──────────────────────────────────────────────────────────
    // Registered in index.ts via MemberService.on* callbacks.
    // CentralBank is the sole authority on all minting and burning decisions.
    // It reads Constitution directly so callers pass only the Member.

    private static readonly MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

    /**
     * Monetary response to a new member joining.
     * 1. Mints the member's back-debt (age × kinPerPersonYear) into the pool
     *    (and optionally a fraction directly to the member).
     * 2. Issues the community endowment if configured.
     */
    handleMemberJoined(member: Member): void {
        const constitution = Constitution.getInstance();
        const age = Math.floor((Date.now() - member.birthDate.getTime()) / CentralBank.MS_PER_YEAR);
        this._mintContribution(member, age * constitution.kinPerPersonYear, constitution.birthdayCirculationFraction, "retirement pool: join back-debt");
        const endowment = constitution.communityEndowment;
        if (endowment > 0)
            this.issueCommunityEndowment(member, Commonwealth.getInstance(), endowment, constitution.demurrageFloor);
    }

    /**
     * Monetary response to a member's annual birthday.
     * Mints one person-year of kin into the pool (and optionally a fraction
     * directly to the member's primary account).
     */
    handleMemberAnniversary(member: Member): void {
        const constitution = Constitution.getInstance();
        this._mintContribution(member, constitution.kinPerPersonYear, constitution.birthdayCirculationFraction, "retirement pool: annual contribution");
    }

    /**
     * Monetary response to a member departing (departure or death).
     * 1. Burns the member's unspent pool entitlement, then clears their SIB record.
     * 2. Reclaims personal and community endowments.
     */
    handleMemberDischarged(member: Member): void {
        const sib = SocialInsuranceBank.getInstance();
        const burn = sib.getUnspentEntitlement(member.getId());
        const available = Math.min(burn, sib.poolBalance);
        if (available > 0)
            this.burnFromPool(sib.poolAccountId, available, "retirement pool: death settlement");
        sib.clearMemberRecord(member.getId());
        this.reclaimEndowment(member);
        const constitution = Constitution.getInstance();
        const endowment = constitution.communityEndowment;
        if (endowment > 0)
            this.reclaimCommunityEndowment(member, Commonwealth.getInstance(), endowment, constitution.demurrageFloor);
    }

    /**
     * Shared minting logic: splits `amount` between the retirement pool and
     * the member's primary account, then records the pool portion in SIB.
     */
    private _mintContribution(member: Member, amount: number, circulationFraction: number, poolMemo: string): void {
        const sib = SocialInsuranceBank.getInstance();
        const directAmount = Math.round(amount * circulationFraction);
        const poolAmount = amount - directAmount;
        if (poolAmount > 0) {
            this.mintToPool(sib.poolAccountId, poolAmount, poolMemo);
            sib.recordContribution(member.getId(), poolAmount);
        }
        if (directAmount > 0)
            this.issueEndowment(member, directAmount);
    }
}
