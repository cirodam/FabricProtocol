import { randomUUID } from "crypto";
import { IAccountOwner } from "../../IAccountOwner.js";
import { Bank } from "../../bank/Bank.js";

// Base class for all functional domains (Food, Healthcare, Childcare, etc.).
// Each domain has its own Bank account, funded by the Commons via fundDomain().
export abstract class FunctionalDomain implements IAccountOwner {
    readonly id: string;
    readonly name: string;
    readonly description: string;

    constructor(name: string, description: string = "") {
        this.id = randomUUID();
        this.name = name;
        this.description = description;
        Bank.getInstance().openAccount(this, "primary", false, true);
    }

    getId(): string { return this.id; }
}
