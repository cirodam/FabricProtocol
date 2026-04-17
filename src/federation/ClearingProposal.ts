import { randomUUID } from "crypto";
import { createHash } from "crypto";

export enum ClearingStatus {
    PROPOSED = "PROPOSED",
    AGREED = "AGREED",
    COMMITTED = "COMMITTED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED",
}

export class ClearingProposal {
    readonly id: string;
    readonly proposingCommunityId: string;
    readonly balanceBefore: number;    // FEC balance before clearing
    readonly cancelAmount: number;     // amount of mutual debt to cancel
    readonly balanceAfter: number;     // FEC balance after clearing
    readonly checksum: string;         // deterministic hash so both sides can verify
    status: ClearingStatus;
    readonly createdAt: Date;
    readonly expiresAt: Date;

    constructor(
        proposingCommunityId: string,
        balanceBefore: number,
        cancelAmount: number,
        expiresInDays: number = 7
    ) {
        this.id = randomUUID();
        this.proposingCommunityId = proposingCommunityId;
        this.balanceBefore = balanceBefore;
        this.cancelAmount = cancelAmount;
        this.balanceAfter = balanceBefore > 0
            ? balanceBefore - cancelAmount
            : balanceBefore + cancelAmount;
        this.checksum = ClearingProposal.computeChecksum(
            proposingCommunityId,
            balanceBefore,
            cancelAmount,
            this.balanceAfter
        );
        this.status = ClearingStatus.PROPOSED;
        this.createdAt = new Date();
        this.expiresAt = new Date(this.createdAt.getTime() + expiresInDays * 86_400_000);
    }

    static computeChecksum(
        proposingCommunityId: string,
        balanceBefore: number,
        cancelAmount: number,
        balanceAfter: number
    ): string {
        return createHash("sha256")
            .update(`${proposingCommunityId}:${balanceBefore}:${cancelAmount}:${balanceAfter}`)
            .digest("hex");
    }

    isExpired(): boolean {
        return new Date() > this.expiresAt;
    }
}
