import { randomUUID } from "crypto";
import { IEconomicActor } from "../../IEconomicActor.js";
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
export abstract class FunctionalUnit implements IEconomicActor {
    readonly id: string;
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
    getDisplayName(): string { return this.name; }
    getHandle(): string { return this.name.toLowerCase().replace(/[^a-z0-9_]/g, "_"); }

    addRole(role: CommunityRole): void { this.roles.push(role); }
    getRoles(): CommunityRole[] { return this.roles; }

    addMember(memberId: string): void { this.memberIds.add(memberId); }
    removeMember(memberId: string): void { this.memberIds.delete(memberId); }
    getMembers(): string[] { return Array.from(this.memberIds); }

    // Pay all active roles from this unit's account.
    payMonthly(bankInst: Bank): void {
        const payerAccount = bankInst.getPrimaryAccount(this.id);
        if (!payerAccount) return;
        for (const role of this.roles) {
            if (!role.isActive()) continue;
            const amount = Math.round(role.creditsPerMonth * 100) / 100;
            if (amount <= 0) continue;
            if (payerAccount.credits < amount) {
                console.warn(`Unit "${this.name}" cannot afford payroll for "${role.title}" (needs ${amount}, has ${payerAccount.credits})`);
                continue;
            }
            const memberAccount = bankInst.getPrimaryAccount(role.memberId!);
            if (!memberAccount) {
                console.warn(`No primary account for role holder ${role.memberId} ("${role.title}")`);
                continue;
            }
            bankInst.transfer(payerAccount.id, memberAccount.id, "credits", amount, `payroll: ${role.title}`);
        }
    }
}
