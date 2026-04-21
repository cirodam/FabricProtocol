export interface AssemblySeat {
    memberId: string;
    seatedAt: Date;
}

/**
 * The Citizens Assembly is the community's top-level governing body.
 * Its size scales with the active membership: max(9, floor(count × 0.15)).
 * Seats are filled by sortition from the full body of active members.
 *
 * There is exactly one assembly per community. It is never created or
 * deleted — only its seats change over time.
 */
export class CitizensAssembly {
    /** How many months a term lasts. */
    termMonths: number;

    private seats: AssemblySeat[];

    constructor(termMonths = 6) {
        this.termMonths = termMonths;
        this.seats = [];
    }

    /**
     * Compute the target assembly size for a given active member count.
     * At least 9 seats; 15 % of active membership rounded down.
     */
    static targetSize(activeMemberCount: number): number {
        return Math.max(9, Math.floor(activeMemberCount * 0.15));
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

    /** Vacancies relative to the given active member count. */
    vacanciesFor(activeMemberCount: number): number {
        return Math.max(0, CitizensAssembly.targetSize(activeMemberCount) - this.seats.length);
    }

    /** Add a seat. No-op if member is already seated or target size reached. */
    addSeat(memberId: string, activeMemberCount: number): boolean {
        if (this.isSeated(memberId) || this.seats.length >= CitizensAssembly.targetSize(activeMemberCount)) return false;
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
