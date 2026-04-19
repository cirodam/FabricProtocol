import { randomUUID } from "crypto";
import { IEconomicActor } from "../IEconomicActor.js";

/**
 * A Group is any named collection that can act as an economic actor —
 * holding a bank account, participating in the marketplace, or receiving payments.
 *
 * Groups are a general primitive. Social groups, households, project teams, and
 * any other voluntary association can all be modeled as a Group.
 */
export class Group implements IEconomicActor {
    readonly id: string;
    name: string;
    description: string;

    constructor(name: string, description: string = "", id?: string) {
        this.id = id ?? randomUUID();
        this.name = name;
        this.description = description;
    }

    getId(): string { return this.id; }
    getDisplayName(): string { return this.name; }
    getHandle(): string { return this.name.toLowerCase().replace(/[^a-z0-9_]/g, "_"); }
}

