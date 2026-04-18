import { randomUUID } from "crypto";
import { IAccountOwner } from "../../IAccountOwner.js";
import { Bank } from "../../bank/Bank.js";
import { FunctionalUnit } from "./FunctionalUnit.js";

// Base class for all functional domains (Food, Healthcare, Childcare, etc.).
// Each domain has its own Bank account, funded by the Commons via fundDomain().
// Domains may contain one or more FunctionalUnits — the operational bodies that
// do the actual work (a mill, a clinic, a grain store, a community kitchen).
export abstract class FunctionalDomain implements IAccountOwner {
    readonly id: string;
    readonly name: string;
    readonly description: string;

    private units: FunctionalUnit[] = [];

    constructor(name: string, description: string = "") {
        this.id = randomUUID();
        this.name = name;
        this.description = description;
        Bank.getInstance().openAccount(this, "primary", false, true);
    }

    getId(): string { return this.id; }

    addUnit(unit: FunctionalUnit): void { this.units.push(unit); }
    getUnits(): FunctionalUnit[] { return this.units; }
}
