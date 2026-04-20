import { randomUUID } from "crypto";
import { IEconomicActor } from "../IEconomicActor.js";

export class Account {
    readonly id: string;
    readonly ownerId: string;
    readonly label: string;
    credits: number = 0;
    fec: number = 0;
    readonly allowNegativeCredits: boolean;
    readonly exemptFromDemurrage: boolean;
    readonly createdAt: Date;

    constructor(owner: IEconomicActor, label: string, allowNegativeCredits: boolean = false, exemptFromDemurrage: boolean = false) {
        this.id = randomUUID();
        this.ownerId = owner.getId();
        this.label = label;
        this.allowNegativeCredits = allowNegativeCredits;
        this.exemptFromDemurrage = exemptFromDemurrage;
        this.createdAt = new Date();
    }
}
