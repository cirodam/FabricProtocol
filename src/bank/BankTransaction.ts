import { randomUUID } from "crypto";

export type Currency = "kin";

export class BankTransaction {
    readonly id: string;
    readonly fromAccountId: string;
    readonly toAccountId: string;
    readonly currency: Currency;
    readonly amount: number;
    readonly memo: string;
    readonly timestamp: Date;

    constructor(
        fromAccountId: string,
        toAccountId: string,
        currency: Currency,
        amount: number,
        memo: string = ""
    ) {
        this.id = randomUUID();
        this.fromAccountId = fromAccountId;
        this.toAccountId = toAccountId;
        this.currency = currency;
        this.amount = amount;
        this.memo = memo;
        this.timestamp = new Date();
    }
}
