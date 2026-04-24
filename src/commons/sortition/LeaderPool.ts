import { randomUUID } from "crypto";

export interface CouncilSeat {
    memberId: string;
    seatedAt: Date;
}

/**
 * A LeaderPool is a community-recognised group of members eligible to be
 * drawn by sortition into governance roles.
 *
 * Each pool carries its own embedded council of up to 5 seats, filled by
 * sortition from pool members.  The council is dormant until the pool
 * exceeds ACTIVATION_THRESHOLD members; once active, vacant seats can be
 * drawn at any time.  Seats expire after one year and are cleared
 * automatically when the pool is read.
 */
export class LeaderPool {
    static readonly COUNCIL_SIZE            = 5;
    static readonly ACTIVATION_THRESHOLD    = 50;

    readonly id: string;
    readonly createdAt: Date;
    poolName: string;
    private members: Set<string>;
    private councilSeats: CouncilSeat[];

    constructor(poolName: string) {
        this.id           = randomUUID();
        this.createdAt    = new Date();
        this.poolName     = poolName;
        this.members      = new Set();
        this.councilSeats = [];
    }

    // ── Pool membership ──────────────────────────────────────────────────────

    addMember(memberId: string): void {
        this.members.add(memberId);
    }

    /** Remove a member from the pool. Also vacates their council seat if held. */
    removeMember(memberId: string): boolean {
        const removed = this.members.delete(memberId);
        if (removed) this.vacateCouncilSeat(memberId);
        return removed;
    }

    hasMember(memberId: string): boolean {
        return this.members.has(memberId);
    }

    getMembers(): string[] {
        return Array.from(this.members);
    }

    get memberCount(): number {
        return this.members.size;
    }

    /** Draw n unique members at random from the full pool roster. */
    draw(n: number): string[] {
        const roster = this.getMembers();
        const count  = Math.min(n, roster.length);
        for (let i = 0; i < count; i++) {
            const j = i + Math.floor(Math.random() * (roster.length - i));
            [roster[i], roster[j]] = [roster[j]!, roster[i]!];
        }
        return roster.slice(0, count);
    }

    // ── Council ──────────────────────────────────────────────────────────────

    /** The council is active only when the pool has more than 50 members. */
    get isActive(): boolean {
        return this.members.size > LeaderPool.ACTIVATION_THRESHOLD;
    }

    get councilSeatCount(): number {
        return this.councilSeats.length;
    }

    get councilVacancies(): number {
        return LeaderPool.COUNCIL_SIZE - this.councilSeats.length;
    }

    getCouncilSeats(): CouncilSeat[] {
        return [...this.councilSeats];
    }

    isSeated(memberId: string): boolean {
        return this.councilSeats.some(s => s.memberId === memberId);
    }

    /** Remove all seats whose 1-year term has expired. */
    clearExpiredCouncilSeats(): void {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        this.councilSeats = this.councilSeats.filter(s => s.seatedAt > oneYearAgo);
    }

    /**
     * Draw pool members by sortition to fill vacant council seats.
     * Already-seated members are excluded from the draw.
     * Returns the IDs of newly seated members (may be fewer than vacancies
     * when the eligible pool is small).
     * No-ops if the council is inactive or already full.
     */
    drawCouncilSeats(): string[] {
        if (!this.isActive) return [];
        const vacancies = this.councilVacancies;
        if (vacancies <= 0) return [];
        const seated   = new Set(this.councilSeats.map(s => s.memberId));
        const eligible = this.getMembers().filter(id => !seated.has(id));
        const count    = Math.min(vacancies, eligible.length);
        for (let i = 0; i < count; i++) {
            const j = i + Math.floor(Math.random() * (eligible.length - i));
            [eligible[i], eligible[j]] = [eligible[j]!, eligible[i]!];
        }
        const drawn = eligible.slice(0, count);
        for (const memberId of drawn) {
            this.councilSeats.push({ memberId, seatedAt: new Date() });
        }
        return drawn;
    }

    /** Vacate a council seat. Returns false if the member was not seated. */
    vacateCouncilSeat(memberId: string): boolean {
        const idx = this.councilSeats.findIndex(s => s.memberId === memberId);
        if (idx === -1) return false;
        this.councilSeats.splice(idx, 1);
        return true;
    }
}
