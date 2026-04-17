import { randomUUID } from "crypto";

export class CareAssignment {
    readonly id: string;
    readonly caregiverId: string;
    readonly recipientId: string;
    readonly assignedAt: Date;

    constructor(caregiverId: string, recipientId: string) {
        this.id = randomUUID();
        this.caregiverId = caregiverId;
        this.recipientId = recipientId;
        this.assignedAt = new Date();
    }
}
