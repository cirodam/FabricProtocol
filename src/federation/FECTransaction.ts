import { randomUUID } from "crypto";

// A FECTransaction (Federated Exchange Credit) records a single inter-community
// trade event. It is not a credit transfer — it updates the bilateral balance
// on a CommunityLink, creating an IOU that is later cleared via ClearingProposal.
export class FECTransaction {
    readonly id: string;
    readonly fromCommunityId: string; // community that owes (buyer's community)
    readonly toCommunityId: string;   // community that is owed (seller's community)
    readonly amount: number;
    readonly memo: string;
    readonly timestamp: Date;

    constructor(
        fromCommunityId: string,
        toCommunityId: string,
        amount: number,
        memo: string = ""
    ) {
        this.id = randomUUID();
        this.fromCommunityId = fromCommunityId;
        this.toCommunityId = toCommunityId;
        this.amount = amount;
        this.memo = memo;
        this.timestamp = new Date();
    }
}
