export class MemberEndowment {
    readonly memberId: string;
    endowment: number;
    communityEndowmentIssued: boolean;

    constructor(memberId: string) {
        this.memberId = memberId;
        this.endowment = 0;
        this.communityEndowmentIssued = false;
    }
}

