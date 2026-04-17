import { randomUUID } from "crypto";
import { ClearingProposal, ClearingStatus } from "./ClearingProposal.js";

export enum LinkStatus {
    PROPOSED = "PROPOSED",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    TERMINATED = "TERMINATED",
}

export enum TrustLevel {
    LOW = "LOW",       // marketplace visible; no credit extended
    MEDIUM = "MEDIUM", // limited credit; members can transact
    HIGH = "HIGH",     // expanded credit; vouching chains extend across link
}

// A CommunityLink represents the full bilateral relationship between this community
// and one other. There is no federation entity — the network is the emergent result
// of communities linking to each other.
export class CommunityLink {
    readonly id: string;
    readonly localCommunityId: string;
    readonly remoteCommunityId: string;
    status: LinkStatus;
    trustLevel: TrustLevel;
    balanceFEC: number;        // positive = remote owes us; negative = we owe remote
    creditLimitFEC: number;    // maximum FEC deficit we will accept from remote
    marketplaceVisible: boolean;
    readonly createdAt: Date;

    private clearingProposals: ClearingProposal[] = [];

    constructor(
        localCommunityId: string,
        remoteCommunityId: string,
        creditLimitFEC: number = 10_000,
        trustLevel: TrustLevel = TrustLevel.LOW
    ) {
        this.id = randomUUID();
        this.localCommunityId = localCommunityId;
        this.remoteCommunityId = remoteCommunityId;
        this.status = LinkStatus.PROPOSED;
        this.trustLevel = trustLevel;
        this.balanceFEC = 0;
        this.creditLimitFEC = creditLimitFEC;
        this.marketplaceVisible = trustLevel !== TrustLevel.LOW ? true : false;
        this.createdAt = new Date();
    }

    activate(): void {
        this.status = LinkStatus.ACTIVE;
        if (this.trustLevel !== TrustLevel.LOW) {
            this.marketplaceVisible = true;
        }
    }

    // Phase 1 — SYN: propose a clearing of mutual debt
    proposeCleaning(): ClearingProposal {
        const cancelAmount = Math.abs(this.balanceFEC);
        if (cancelAmount === 0) throw new Error("No balance to clear");

        const proposal = new ClearingProposal(
            this.localCommunityId,
            this.balanceFEC,
            cancelAmount
        );
        this.clearingProposals.push(proposal);
        return proposal;
    }

    // Phase 2 — SYN-ACK: remote community verifies and agrees
    agreeCleaning(proposalId: string, remoteCommunityId: string): void {
        const proposal = this.getProposal(proposalId);
        if (!proposal) throw new Error(`Proposal ${proposalId} not found`);
        if (proposal.status !== ClearingStatus.PROPOSED) throw new Error(`Proposal is not open`);
        if (proposal.isExpired()) {
            proposal.status = ClearingStatus.EXPIRED;
            throw new Error(`Proposal has expired`);
        }

        // Remote independently verifies the checksum
        const expectedChecksum = ClearingProposal.computeChecksum(
            proposal.proposingCommunityId,
            proposal.balanceBefore,
            proposal.cancelAmount,
            proposal.balanceAfter
        );
        if (expectedChecksum !== proposal.checksum) {
            proposal.status = ClearingStatus.REJECTED;
            throw new Error(`Checksum mismatch — ledger discrepancy detected`);
        }

        proposal.status = ClearingStatus.AGREED;
    }

    // Phase 3 — ACK: commit the clearing, update balance
    commitClearing(proposalId: string): void {
        const proposal = this.getProposal(proposalId);
        if (!proposal) throw new Error(`Proposal ${proposalId} not found`);
        if (proposal.status !== ClearingStatus.AGREED) throw new Error(`Proposal has not been agreed`);

        this.balanceFEC = proposal.balanceAfter;
        proposal.status = ClearingStatus.COMMITTED;
    }

    rejectClearing(proposalId: string): void {
        const proposal = this.getProposal(proposalId);
        if (!proposal) throw new Error(`Proposal ${proposalId} not found`);
        proposal.status = ClearingStatus.REJECTED;
    }

    getClearingProposals(): ClearingProposal[] {
        return [...this.clearingProposals];
    }

    private getProposal(id: string): ClearingProposal | undefined {
        return this.clearingProposals.find((p) => p.id === id);
    }
}
