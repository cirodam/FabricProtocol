import { randomUUID } from "crypto";
import { IEconomicActor } from "../IEconomicActor.js";

export class BankAccount {
    readonly id: string;
    readonly ownerId: string;
    readonly label: string;
    kin: number = 0;
    readonly allowNegativeKin: boolean;
    readonly exemptFromDemurrage: boolean;
    readonly createdAt: Date;

    constructor(owner: IEconomicActor, label: string, allowNegativeKin: boolean = false, exemptFromDemurrage: boolean = false) {
        this.id = randomUUID();
        this.ownerId = owner.getId();
        this.label = label;
        this.allowNegativeKin = allowNegativeKin;
        this.exemptFromDemurrage = exemptFromDemurrage;
        this.createdAt = new Date();
    }
}
