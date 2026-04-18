import { randomUUID } from "crypto";
import { IAccountOwner, OwnerType } from "../IAccountOwner.js";

export class Account {
    readonly id: string;
    readonly ownerId: string;
    readonly ownerType: OwnerType;
    readonly label: string;
    credits: number = 0;
    foodVouchers: number = 0;
    fec: number = 0;
    readonly allowNegativeCredits: boolean;
    readonly exemptFromDemurrage: boolean;
    readonly createdAt: Date;

    constructor(owner: IAccountOwner, label: string, allowNegativeCredits: boolean = false, exemptFromDemurrage: boolean = false) {
        this.id = randomUUID();
        this.ownerId = owner.getId();
        this.ownerType = owner.ownerType;
        this.label = label;
        this.allowNegativeCredits = allowNegativeCredits;
        this.exemptFromDemurrage = exemptFromDemurrage;
        this.createdAt = new Date();
    }
}
