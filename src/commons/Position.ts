import { randomUUID } from "crypto";

export class Position {
    readonly id: string;
    title: string;
    description: string;
    memberId: string | null;
    termStartDate: Date | null;
    termEndDate: Date | null;
    creditsPerMonth: number;
    funded: boolean;

    constructor(title: string, description: string = "", creditsPerMonth: number = 0) {
        this.id = randomUUID();
        this.title = title;
        this.description = description;
        this.creditsPerMonth = creditsPerMonth;
        this.memberId = null;
        this.termStartDate = null;
        this.termEndDate = null;
        this.funded = creditsPerMonth > 0;
    }

    isActive(): boolean {
        if (!this.memberId) return false;
        if (!this.funded) return false;
        const now = new Date();
        if (this.termStartDate && now < this.termStartDate) return false;
        if (this.termEndDate && now > this.termEndDate) return false;
        return true;
    }
}
