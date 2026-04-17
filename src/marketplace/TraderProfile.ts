import { randomUUID } from "crypto";

// TraderProfile is a marketplace registration for any entity that wants to trade.
// The marketplace holds a registry of these. Members and enterprises create one
// to participate; the commons or a domain can create one on their behalf.
export class TraderProfile {
    readonly id: string;
    displayName: string;
    readonly accountId: string;     // Bank account used for marketplace transactions
    readonly registeredAt: Date;

    constructor(displayName: string, accountId: string) {
        this.id = randomUUID();
        this.displayName = displayName;
        this.accountId = accountId;
        this.registeredAt = new Date();
    }
}
