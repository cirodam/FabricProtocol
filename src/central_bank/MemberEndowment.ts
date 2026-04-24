export class MemberEndowment {
    readonly memberId: string;
    private _endowment: number;
    private _communityEndowmentIssued: boolean;

    constructor(memberId: string) {
        this.memberId = memberId;
        this._endowment = 0;
        this._communityEndowmentIssued = false;
    }

    static restore(memberId: string, endowment: number, communityEndowmentIssued: boolean): MemberEndowment {
        const e = new MemberEndowment(memberId);
        e._endowment = endowment;
        e._communityEndowmentIssued = communityEndowmentIssued;
        return e;
    }

    get endowment(): number { return this._endowment; }
    get communityEndowmentIssued(): boolean { return this._communityEndowmentIssued; }

    addEndowment(amount: number): void {
        this._endowment += amount;
    }

    markCommunityEndowmentIssued(): void {
        this._communityEndowmentIssued = true;
    }
}

