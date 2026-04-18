import { randomUUID } from "crypto";

// Activities of Daily Living — true means the member needs assistance with that activity
export interface CareNeeds {
    feeding: boolean;
    bathing: boolean;
    dressing: boolean;
    toileting: boolean;
    mobility: boolean;
    medicationManagement: boolean;
}

export const NO_CARE_NEEDS: CareNeeds = {
    feeding: false,
    bathing: false,
    dressing: false,
    toileting: false,
    mobility: false,
    medicationManagement: false,
};

export class DependencyCareProfile {
    readonly id: string;
    readonly memberId: string;
    careNeeds: CareNeeds;
    notes: string;
    readonly createdAt: Date;

    constructor(memberId: string, careNeeds: CareNeeds = NO_CARE_NEEDS, notes: string = "") {
        this.id = randomUUID();
        this.memberId = memberId;
        this.careNeeds = careNeeds;
        this.notes = notes;
        this.createdAt = new Date();
    }
}
