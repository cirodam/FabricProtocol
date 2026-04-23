import { randomUUID } from "crypto";
import { IEconomicActor } from "../../IEconomicActor.js";
import { Bank } from "../../bank/Bank.js";
import { FunctionalUnit } from "./FunctionalUnit.js";
import { CommunityRole } from "../CommunityRole.js";

export interface BudgetLineItem {
    label: string;
    amount: number;
}

export interface DomainBudget {
    lineItems: BudgetLineItem[];
    total: number;
}

// Base class for all functional domains (Food, Healthcare, Childcare, etc.).
// Each domain has its own Bank account, funded by the Commons via fundDomain().
// The domain is responsible for paying its own role-holders and those of its units.
// Domains may contain one or more FunctionalUnits — the operational bodies that
// do the actual work (a mill, a clinic, a grain store, a community kitchen).
export abstract class FunctionalDomain implements IEconomicActor {
    readonly id: string;
    readonly name: string;
    readonly description: string;

    private roles: CommunityRole[] = [];
    private units: FunctionalUnit[] = [];

    constructor(name: string, description: string = "", id?: string) {
        this.id = id ?? randomUUID();
        this.name = name;
        this.description = description;
        if (!Bank.getInstance().getPrimaryAccount(this.id)) {
            Bank.getInstance().openAccount(this, "primary", 0, true);
        }
    }

    getId(): string { return this.id; }
    getDisplayName(): string { return this.name; }
    getHandle(): string { return this.name.toLowerCase().replace(/[^a-z0-9_]/g, "_"); }

    addRole(role: CommunityRole): void { this.roles.push(role); }
    removeRole(memberId: string): void { this.roles = this.roles.filter(r => r.memberId !== memberId); }
    removeRoleById(id: string): void { this.roles = this.roles.filter(r => r.id !== id); }
    getRoles(): CommunityRole[] { return this.roles; }

    addUnit(unit: FunctionalUnit): void { this.units.push(unit); }
    removeUnit(id: string): void { this.units = this.units.filter(u => u.id !== id); }
    getUnits(): FunctionalUnit[] { return this.units; }
    getUnitsByType<T extends FunctionalUnit>(type: string): T[] {
        return this.units.filter(u => u.getType() === type) as T[];
    }

    // Monthly payroll: domain-level roles plus all units.
    getPayroll(): number {
        const domainPayroll = this.roles
            .filter(r => r.isActive())
            .reduce((sum, r) => sum + r.kinPerMonth, 0);
        const unitsPayroll = this.units.reduce((sum, u) => sum + u.getPayroll(), 0);
        return domainPayroll + unitsPayroll;
    }

    // Budget breakdown for this domain. Override in subclasses to add domain-specific line items.
    getBudget(): DomainBudget {
        const lineItems: BudgetLineItem[] = [];
        for (const role of this.roles.filter(r => r.isActive())) {
            lineItems.push({ label: role.title, amount: role.kinPerMonth });
        }
        for (const unit of this.units) {
            const payroll = unit.getPayroll();
            if (payroll > 0) lineItems.push({ label: unit.getDisplayName(), amount: payroll });
        }
        const total = lineItems.reduce((sum, i) => sum + i.amount, 0);
        return { lineItems, total };
    }

    // Pay domain-level roles, then delegate to each unit.
    payMonthly(): void {
        const bankInst = Bank.getInstance();
        const payerAccount = bankInst.getPrimaryAccount(this.id);
        if (!payerAccount) return;
        for (const role of this.roles) {
            if (!role.isActive()) continue;
            const amount = Math.round(role.kinPerMonth * 100) / 100;
            if (amount <= 0) continue;
            if (payerAccount.kin < amount) {
                console.warn(`Domain "${this.name}" cannot afford payroll for "${role.title}" (needs ${amount}, has ${payerAccount.kin})`);
                continue;
            }
            const memberAccount = bankInst.getPrimaryAccount(role.memberId!);
            if (!memberAccount) {
                console.warn(`No primary account for role holder ${role.memberId} ("${role.title}")`);
                continue;
            }
            bankInst.transfer(payerAccount.id, memberAccount.id, "kin", amount, `payroll: ${role.title}`);
        }
        for (const unit of this.units) {
            unit.payMonthly(bankInst);
        }
    }
}
