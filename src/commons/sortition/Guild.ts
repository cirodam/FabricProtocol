import { randomUUID } from "crypto";

/**
 * A Guild is a community-recognized body of members organized around a shared
 * domain or trade. Members of a guild are eligible to be drawn by sortition
 * to fill seats on the domain's governing council.
 *
 * Communities may name their guilds whatever fits their context — "Farmers",
 * "Medical Workers", "Fire Department", "Caregivers" — the guild concept is
 * the same: a formally recognized group whose members have a governance role.
 */
export class Guild {
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
