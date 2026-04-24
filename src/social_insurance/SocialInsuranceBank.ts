import { IEconomicActor } from "../IEconomicActor.js";
import { Bank } from "../bank/Bank.js";
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
 *
 * SocialInsuranceBank is responsible for pool accounting and payout mechanics.
 * All minting and burning decisions are owned by CentralBank, which calls
 * {@link recordContribution} and {@link clearMemberRecord} after each monetary
 * action to keep the records in sync.
 */
export class SocialInsuranceBank implements IEconomicActor {
    private static instance: SocialInsuranceBank;

    /** Stable singleton ID — never reused. */
    readonly id = "00000000-0000-0000-0000-000000000003";

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

    /** Sum of all poolContributed across every member record. Used to restore CentralBank.poolIssued on startup. */
    getTotalPoolContributed(): number {
        let total = 0;
        for (const r of this.records.values()) total += r.poolContributed;
        return total;
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
     * Record that `poolAmount` kin has been minted into the pool on behalf of
     * this member. Called by CentralBank after each mint operation.
     * Creates the member record if it does not yet exist.
     */
    recordContribution(memberId: string, poolAmount: number): void {
        let r = this.records.get(memberId);
        if (!r) {
            r = new SocialInsuranceMember(memberId);
            this.records.set(memberId, r);
        }
        r.poolContributed += poolAmount;
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
     * Returns the unspent entitlement for a member: `max(0, contributed − received)`.
     * Called by CentralBank to determine how much to burn on member departure.
     */
    getUnspentEntitlement(memberId: string): number {
        const r = this.records.get(memberId);
        if (!r) return 0;
        return Math.max(0, r.poolContributed - r.poolReceived);
    }

    /**
     * Remove a member's pool record after CentralBank has burned their entitlement.
     * Called by CentralBank as part of the discharge flow.
     */
    clearMemberRecord(memberId: string): void {
        this.records.delete(memberId);
        this.loader?.delete(memberId);
    }
}
