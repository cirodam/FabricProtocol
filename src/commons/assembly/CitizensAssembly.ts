export interface AssemblySeat {
    memberId: string;
    seatedAt: Date;
}

/**
 * The Citizens Assembly is the community's top-level governing body.
 * It has 50 seats filled by sortition from a linked pool.
 *
 * There is exactly one assembly per community. It is never created or
 * deleted — only its seats and linked pool change over time.
 */
export class CitizensAssembly {
    static readonly SIZE = 50;

    poolId: string | null;
    private seats: AssemblySeat[];

    constructor(poolId: string | null = null) {
        this.poolId = poolId;
        this.seats  = [];
    }

    getSeats(): AssemblySeat[] {
        return [...this.seats];
    }

    isSeated(memberId: string): boolean {
        return this.seats.some(s => s.memberId === memberId);
    }

    get seatCount(): number {
        return this.seats.length;
    }

    get vacancies(): number {
        return CitizensAssembly.SIZE - this.seats.length;
    }

    /** Add a seat. No-op if member is already seated or assembly is full. */
    addSeat(memberId: string): boolean {
        if (this.isSeated(memberId) || this.seats.length >= CitizensAssembly.SIZE) return false;
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
