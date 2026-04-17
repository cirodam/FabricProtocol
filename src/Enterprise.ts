import { randomUUID } from "crypto";
import { IAccountOwner } from "./IAccountOwner.js";
import { Bank } from "./bank/Bank.js";

// Enterprise represents a cooperative productive venture between members.
// It is tracked by the commons only for marketplace participation purposes.
// Internal membership, roles, and earnings distribution are managed outside this protocol.
export class Enterprise implements IAccountOwner {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly foundedAt: Date;

    constructor(name: string, description: string = "") {
        this.id = randomUUID();
        this.name = name;
        this.description = description;
        this.foundedAt = new Date();
        Bank.getInstance().openAccount(this, "primary");
    }

    getId(): string { return this.id; }
}
