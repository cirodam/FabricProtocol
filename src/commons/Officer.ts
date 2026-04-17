import { randomUUID } from "crypto";
import { VoteThreshold } from "./Proposal.js";

// An Officer is an elected governance role, accountable to the community.
// Election requires a passed proposal with the appropriate threshold.
export class Officer {
    readonly id: string;
    title: string;
    memberId: string | null;
    readonly electionThreshold: VoteThreshold;
    termStartDate: Date | null;
    termEndDate: Date | null;

    constructor(
        title: string,
        electionThreshold: VoteThreshold = VoteThreshold.SIMPLE_MAJORITY,
        memberId: string | null = null
    ) {
        this.id = randomUUID();
        this.title = title;
        this.electionThreshold = electionThreshold;
        this.memberId = memberId;
        this.termStartDate = null;
        this.termEndDate = null;
    }

    isActive(): boolean {
        if (!this.memberId) return false;
        const now = new Date();
        if (this.termStartDate && now < this.termStartDate) return false;
        if (this.termEndDate && now > this.termEndDate) return false;
        return true;
    }
}
