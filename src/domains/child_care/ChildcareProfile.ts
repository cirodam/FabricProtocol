import { randomUUID } from "crypto";

export class ChildcareProfile {
    readonly id: string;
    readonly memberId: string;
    dateOfBirth: Date;
    notes: string;
    readonly createdAt: Date;

    constructor(memberId: string, dateOfBirth: Date, notes: string = "") {
        this.id = randomUUID();
        this.memberId = memberId;
        this.dateOfBirth = dateOfBirth;
        this.notes = notes;
        this.createdAt = new Date();
    }

    ageInMonths(): number {
        const now = new Date();
        return (now.getFullYear() - this.dateOfBirth.getFullYear()) * 12
            + (now.getMonth() - this.dateOfBirth.getMonth());
    }
}
