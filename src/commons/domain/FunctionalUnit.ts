import { randomUUID } from "crypto";
import { IAccountOwner, OwnerType } from "../../IAccountOwner.js";
import { Bank } from "../../bank/Bank.js";
import { CommunityRole } from "../CommunityRole.js";

/**
 * A FunctionalUnit is the operational body that does the actual work within a domain.
 * Where a FunctionalDomain represents the community's mandate for a function,
 * a FunctionalUnit executes it — a mill, a clinic, a bakery, a grain store.
 *
 * Each unit has its own Bank account, funded by its parent domain. It holds positions
 * (paid roles) and a member roster. Multiple units can exist within a single domain
 * as the community grows.
 */
export abstract class FunctionalUnit implements IAccountOwner {
    readonly id: string;
    readonly ownerType: OwnerType = "unit";
    readonly name: string;
    readonly description: string;

    private roles: CommunityRole[] = [];
    private memberIds: Set<string> = new Set();

    constructor(name: string, description: string = "") {
        this.id = randomUUID();
        this.name = name;
        this.description = description;
        Bank.getInstance().openAccount(this, "primary", false, false);
    }

    getId(): string { return this.id; }

    addRole(role: CommunityRole): void { this.roles.push(role); }
    getRoles(): CommunityRole[] { return this.roles; }

    addMember(memberId: string): void { this.memberIds.add(memberId); }
    removeMember(memberId: string): void { this.memberIds.delete(memberId); }
    getMembers(): string[] { return Array.from(this.memberIds); }
}
