import { randomUUID } from "crypto";

// TraderProfile is a marketplace registration for any entity that wants to trade.
// The marketplace holds a registry of these. Members and enterprises create one
// to participate; the commons or a domain can create one on their behalf.
// A profile may represent one person or several people working together
// (e.g. a household, a small co-op). The handle is a short unique tag used
// in SMS commands: SEND 50 john groceries
export class TraderProfile {
    readonly id: string;
    displayName: string;
    handle: string;             // unique within the community, e.g. "john" or "miller_co"
    readonly accountId: string;
    readonly registeredAt: Date;

    constructor(displayName: string, handle: string, accountId: string) {
        this.id = randomUUID();
        this.displayName = displayName;
        this.handle = handle.toLowerCase().replace(/[^a-z0-9_]/g, "");
        this.accountId = accountId;
        this.registeredAt = new Date();
    }
}
