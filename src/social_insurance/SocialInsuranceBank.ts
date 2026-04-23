import { IEconomicActor } from "../IEconomicActor.js";
import { Bank } from "../bank/Bank.js";
import { CentralBank } from "../central_bank/CentralBank.js";
import { Member } from "../member/Member.js";
import { SocialInsuranceMember } from "./SocialInsuranceMember.js";
import { SocialInsuranceMemberLoader } from "./SocialInsuranceMemberLoader.js";

/**
 * The SocialInsuranceBank maintains the community retirement pool.
 *
 * Every member contributes to the pool each year (birthday deposit = one
 * person-year of kin, minted by the CentralBank directly into the pool).
 * The pool is also seeded at join time with the member's full back-debt
 * (age × kinPerPersonYear).
 *
 * On retirement, members receive equal monthly payments drawn from the pool.
 *
 * On death, the member's unspent entitlement (contributed − received) is
 * burned from the pool, shrinking the money supply to match the living
 * population.
 *
 * The pool account is exempt from demurrage — it is a deferred liability,
 * not circulating kin.
 */
export class SocialInsuranceBank implements IEconomicActor {
    private static instance: SocialInsuranceBank;

    /** Stable singleton ID — never reused. */
    readonly id = "00000000-0000-0000-0000-000000000002";

    private records: Map<string, SocialInsuranceMember> = new Map();
    private loader: SocialInsuranceMemberLoader | null = null;

    private constructor() {
        if (!Bank.getInstance().getPrimaryAccount(this.id)) {
            Bank.getInstance().openAccount(this, "primary", 0, true);
        }
    }

    static getInstance(): SocialInsuranceBank {
        if (!SocialInsuranceBank.instance) {
            SocialInsuranceBank.instance = new SocialInsuranceBank();
        }
        return SocialInsuranceBank.instance;
    }

    /** Load persisted records. Call once at startup. */
    init(loader: SocialInsuranceMemberLoader): void {
        this.loader = loader;
        for (const r of loader.loadAll()) {
            this.records.set(r.memberId, r);
        }
    }

    getId(): string { return this.id; }
    getDisplayName(): string { return "Social Insurance Bank"; }
    getHandle(): string { return "social_insurance"; }

    /**
     * Backfill pool contributions for members who joined before the social
     * insurance system existed. Calculates each member's expected contribution
     * (age × kinPerPersonYear) and mints the deficit into the pool.
     * Safe to call on every startup — no-ops for members already fully contributed.
     */
    backfillMembers(members: Member[], kinPerPersonYear: number): void {
        const now = Date.now();
        const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
        for (const member of members) {
            const age = Math.floor((now - member.birthDate.getTime()) / MS_PER_YEAR);
            const expected = age * kinPerPersonYear;
            const r = this.records.get(member.getId()) ?? new SocialInsuranceMember(member.getId());
            const deficit = expected - r.poolContributed;
            if (deficit > 0) {
                r.poolContributed += deficit;
                if (!this.records.has(member.getId())) this.records.set(r.memberId, r);
                CentralBank.getInstance().mintToPool(this.poolAccountId, deficit, "retirement pool: backfill");
                this.loader?.save(r);
            }
        }
    }

    /** Current balance of the retirement pool. */
    get poolBalance(): number {
        return Bank.getInstance().getPrimaryAccount(this.id)?.kin ?? 0;
    }

    /** Pool account ID, used by CentralBank to target minting/burning. */
    get poolAccountId(): string {
        const acct = Bank.getInstance().getPrimaryAccount(this.id);
        if (!acct) throw new Error("SocialInsuranceBank has no pool account");
        return acct.id;
    }

    /**
     * Mint kin into the pool on behalf of a member (join back-debt or birthday).
     * The CentralBank records the issuance so desiredMoneyInCirculation stays
     * accurate.
     */
    depositContribution(member: Member, amount: number): void {
        let r = this.records.get(member.getId());
        if (!r) {
            r = new SocialInsuranceMember(member.getId());
            this.records.set(r.memberId, r);
        }
        r.poolContributed += amount;
        CentralBank.getInstance().mintToPool(this.poolAccountId, amount, "retirement pool: contribution");
        this.loader?.save(r);
    }

    /**
     * Distribute monthly retirement payments to all retired members.
     * Total payout = poolBalance × payoutRate, split equally among retirees.
     * Each payment transfers from the pool to the retiree's primary account.
     */
    issueMonthlyPayments(retiredMembers: Member[], payoutRate: number): void {
        if (retiredMembers.length === 0) return;
        const totalPayout = Math.floor(this.poolBalance * payoutRate);
        if (totalPayout <= 0) return;

        const perPerson = Math.floor(totalPayout / retiredMembers.length);
        if (perPerson <= 0) return;

        const bankInst = Bank.getInstance();
        const poolAccount = bankInst.getPrimaryAccount(this.id);
        if (!poolAccount) return;

        for (const member of retiredMembers) {
            const memberAccount = bankInst.getPrimaryAccount(member.getId());
            if (!memberAccount) continue;

            bankInst.transfer(poolAccount.id, memberAccount.id, "kin", perPerson, "retirement income");

            let r = this.records.get(member.getId());
            if (!r) {
                r = new SocialInsuranceMember(member.getId());
                this.records.set(r.memberId, r);
            }
            r.poolReceived += perPerson;
            this.loader?.save(r);
        }
    }

    /**
     * On member death: burn their unspent entitlement from the pool.
     * burn = max(0, contributed − received)
     * This contracts the money supply by exactly the amount owed to this person
     * that was never spent, preserving the invariant that total supply ∝ living
     * population.
     */
    settleDeath(member: Member): void {
        const r = this.records.get(member.getId());
        if (!r) return;

        const burn = Math.max(0, r.poolContributed - r.poolReceived);
        if (burn > 0) {
            const available = Math.min(burn, this.poolBalance);
            if (available > 0) {
                CentralBank.getInstance().burnFromPool(this.poolAccountId, available, "retirement pool: death settlement");
            }
        }

        this.records.delete(member.getId());
        this.loader?.delete(member.getId());
    }
}
