export interface CouncilSeat {
    memberId: string;
    seatedAt: Date;
}

/**
 * A DomainCouncil is the permanent oversight body for a functional domain.
 * It has exactly 5 seats, filled by drawing from a linked sortition pool.
 *
 * Every domain has exactly one council — it is not created or deleted,
 * only its seats and linked pool change over time. Sortition-based selection
 * removes competitive election dynamics and rotates responsibility through
 * the broader membership.
 */
export class DomainCouncil {
    static readonly SIZE = 5;

    readonly domainId: string;
    readonly domainName: string;
    poolId: string | null;
    private seats: CouncilSeat[];

    constructor(domainId: string, domainName: string, poolId: string | null = null) {
        this.domainId   = domainId;
        this.domainName = domainName;
        this.poolId     = poolId;
        this.seats      = [];
    }

    getSeats(): CouncilSeat[] {
        return [...this.seats];
    }

    isSeated(memberId: string): boolean {
        return this.seats.some(s => s.memberId === memberId);
    }

    get seatCount(): number {
        return this.seats.length;
    }

    get vacancies(): number {
        return DomainCouncil.SIZE - this.seats.length;
    }

    /** Add a seat. No-op if member is already seated or council is full. */
    addSeat(memberId: string): boolean {
        if (this.isSeated(memberId) || this.seats.length >= DomainCouncil.SIZE) return false;
        this.seats.push({ memberId, seatedAt: new Date() });
        return true;
    }

    /** Vacate a seat by memberId. Returns true if the seat existed. */
    vacateSeat(memberId: string): boolean {
        const idx = this.seats.findIndex(s => s.memberId === memberId);
        if (idx === -1) return false;
        this.seats.splice(idx, 1);
        return true;
    }

    /** Clear all seats. */
    clearSeats(): void {
        this.seats = [];
    }

    /** IDs of currently seated members (used to exclude from draw). */
    seatedMemberIds(): string[] {
        return this.seats.map(s => s.memberId);
    }
}
