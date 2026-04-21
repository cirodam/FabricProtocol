import { randomUUID } from "crypto";

export interface CouncilSeat {
    memberId: string;
    seatedAt: Date;
}

/**
 * A DomainCouncil is a governance body with purview over one or more
 * functional domains. It has 3–5 seats (default 5) filled by drawing
 * from a linked sortition pool of domain-qualified members.
 *
 * A council may cover multiple domains — groupings are set at community
 * formation and can be split by assembly vote as the community grows.
 */
export class DomainCouncil {
    static readonly DEFAULT_SIZE = 5;

    readonly id: string;
    name: string;
    /** All domain IDs this council has purview over. */
    domainIds: string[];
    targetSize: number;
    poolId: string | null;
    private seats: CouncilSeat[];

    constructor(
        name: string,
        domainIds: string[],
        poolId: string | null = null,
        targetSize: number    = DomainCouncil.DEFAULT_SIZE,
        id?: string,
    ) {
        this.id         = id ?? randomUUID();
        this.name       = name;
        this.domainIds  = domainIds;
        this.targetSize = Math.min(5, Math.max(3, targetSize));
        this.poolId     = poolId;
        this.seats      = [];
    }

    /** Primary domain (first in list) — for display and legacy compat. */
    get primaryDomainId(): string | null { return this.domainIds[0] ?? null; }

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
        return this.targetSize - this.seats.length;
    }

    /** Add a seat. No-op if member is already seated or council is full. */
    addSeat(memberId: string): boolean {
        if (this.isSeated(memberId) || this.seats.length >= this.targetSize) return false;
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
