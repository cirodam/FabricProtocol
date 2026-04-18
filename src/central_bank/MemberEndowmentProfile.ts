/**
 * Tracks the monetary relationship between the CentralBank and a single member.
 * The endowment is money issued to the member on joining — a grant, not a loan.
 * On exit, up to the endowment amount is reclaimed; any shortfall is left as a
 * negative bank balance and recovered gradually through demurrage.
 */
export class MemberEndowmentProfile {
    readonly memberId: string;

    /** Total credits issued to this member across all top-ups. */
    endowment: number;

    /** Set on member exit: credits that could not be reclaimed (left in circulation). */
    shortfall: number;

    /** True once the member has departed or died. */
    departed: boolean;

    constructor(memberId: string) {
        this.memberId = memberId;
        this.endowment = 0;
        this.shortfall = 0;
        this.departed = false;
    }
}
