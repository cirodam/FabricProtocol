import { randomUUID } from "crypto";

export enum VoteThreshold {
    SIMPLE_MAJORITY = "SIMPLE_MAJORITY",
    SUPERMAJORITY = "SUPERMAJORITY",
    NEAR_CONSENSUS = "NEAR_CONSENSUS",
}

export enum ProposalStatus {
    OPEN = "OPEN",
    PASSED = "PASSED",
    FAILED = "FAILED",
}

export class Proposal {
    readonly id: string;
    readonly proposerId: string;
    readonly title: string;
    readonly description: string;
    readonly threshold: VoteThreshold;
    readonly createdAt: Date;
    readonly closesAt: Date;
    status: ProposalStatus;

    private yesVotes: Set<string> = new Set(); // memberIds
    private noVotes: Set<string> = new Set();

    constructor(
        proposerId: string,
        title: string,
        description: string,
        threshold: VoteThreshold,
        deliberationDays: number
    ) {
        this.id = randomUUID();
        this.proposerId = proposerId;
        this.title = title;
        this.description = description;
        this.threshold = threshold;
        this.status = ProposalStatus.OPEN;
        this.createdAt = new Date();
        this.closesAt = new Date(this.createdAt.getTime() + deliberationDays * 86_400_000);
    }

    vote(memberId: string, inFavor: boolean): void {
        this.yesVotes.delete(memberId);
        this.noVotes.delete(memberId);
        if (inFavor) {
            this.yesVotes.add(memberId);
        } else {
            this.noVotes.add(memberId);
        }
    }

    get yesCount(): number { return this.yesVotes.size; }
    get noCount(): number { return this.noVotes.size; }
    get totalVotes(): number { return this.yesVotes.size + this.noVotes.size; }
}
