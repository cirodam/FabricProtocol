import { randomUUID } from "crypto";

/**
 * A SortitionPool is a named roster of members from which a random selection
 * (sortition) can be drawn to fill a deliberative body, jury, or other
 * governance role.
 *
 * Sortition — selection by lot — is one of the oldest democratic mechanisms.
 * Ancient Athens used it to staff most public offices. Contemporary citizen
 * assembly practice (Ireland, France, Canada) selects panels stratified by
 * demographic criteria. In a community economy, pools provide a transparent,
 * bias-resistant way to constitute councils, review panels, and oversight
 * committees without the campaign dynamics of competitive election.
 *
 * A pool simply holds a roster. The draw logic is kept separate so callers
 * can apply stratification, exclusion rules, or weighting before selecting.
 */
export class SortitionPool {
    readonly id: string;
    readonly createdAt: Date;
    name: string;
    description: string;
    private members: Set<string>;

    constructor(name: string, description: string = "") {
        this.id          = randomUUID();
        this.createdAt   = new Date();
        this.name        = name;
        this.description = description;
        this.members     = new Set();
    }

    addMember(memberId: string): void {
        this.members.add(memberId);
    }

    removeMember(memberId: string): boolean {
        return this.members.delete(memberId);
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

    /**
     * Draw n unique members at random. Returns fewer than n if the pool is
     * smaller than the requested count.
     */
    draw(n: number): string[] {
        const roster = this.getMembers();
        const count  = Math.min(n, roster.length);
        // Fisher-Yates partial shuffle
        for (let i = 0; i < count; i++) {
            const j = i + Math.floor(Math.random() * (roster.length - i));
            [roster[i], roster[j]] = [roster[j]!, roster[i]!];
        }
        return roster.slice(0, count);
    }
}
