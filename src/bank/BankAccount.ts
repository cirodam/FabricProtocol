import { randomUUID } from "crypto";
import { IEconomicActor } from "../IEconomicActor.js";

export class BankAccount {
    readonly id: string;
    readonly ownerId: string;
    readonly label: string;
    kin: number = 0;
    /**
     * The minimum balance allowed (inclusive). Debits that would push kin below
     * this value are rejected. Use -Infinity for accounts with no floor
     * (e.g. the central bank issuing account).
     */
    readonly overdraftLimit: number;
    readonly exemptFromDemurrage: boolean;
    readonly createdAt: Date;

    constructor(owner: IEconomicActor, label: string, overdraftLimit: number = 0, exemptFromDemurrage: boolean = false) {
        this.id = randomUUID();
        this.ownerId = owner.getId();
        this.label = label;
        this.overdraftLimit = overdraftLimit;
        this.exemptFromDemurrage = exemptFromDemurrage;
        this.createdAt = new Date();
    }
}
