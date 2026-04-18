import { randomUUID } from "crypto";
import { IAccountOwner, OwnerType } from "../bank/IAccountOwner.js";
import { MemberType } from "../domains/food/NutritionalProfile.js";

export class Member implements IAccountOwner {

    readonly id: string;
    readonly ownerType: OwnerType = "member";
    firstName: string;
    lastName: string;
    birthDate: Date;
    memberType: MemberType;
    readonly joinDate: Date;
    physicalCapacity: number;    // 0.0–1.0
    cognitiveCapacity: number;   // 0.0–1.0
    trustScore: number;          // 0.0–1.0
    guardianId: string | null;
    dependencyCareId: string | null;
    phone: string | null;        // E.164, e.g. "+15551234567". null if no phone.
    pinHash: string | null;      // SHA-256 hex of PIN. null until set.
    constructor(
        firstName: string,
        lastName: string,
        birthDate: Date,
        memberType: MemberType = MemberType.ADULT,
        physicalCapacity: number = 1.0,
        cognitiveCapacity: number = 1.0,
        trustScore: number = 1.0
    ) {
        this.id = randomUUID();
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthDate = birthDate;
        this.joinDate = new Date();
        this.memberType = memberType;
        this.physicalCapacity = physicalCapacity;
        this.cognitiveCapacity = cognitiveCapacity;
        this.trustScore = trustScore;
        this.guardianId = null;
        this.dependencyCareId = null;
        this.phone = null;
        this.pinHash = null;
    }

    getId(): string { return this.id; }
}
