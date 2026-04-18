export class MemberEndowment {
    readonly memberId: string;
    endowment: number;

    constructor(memberId: string) {
        this.memberId = memberId;
        this.endowment = 0;
    }
}

