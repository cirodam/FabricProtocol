import { randomUUID } from "crypto";
import { IEconomicActor } from "../IEconomicActor.js";

export interface LanguageProficiency {
    language: string;   // BCP 47, e.g. "en", "es", "zh-Hans"
    reading: boolean;
    writing: boolean;
    speaking: boolean;
}

export class Member implements IEconomicActor {

    readonly id: string;
    firstName: string;
    lastName: string;
    birthDate: Date;
    readonly joinDate: Date;
    handle: string;              // lowercase alphanumeric + underscores, unique in community
    disabled: boolean;            // community-determined; exempt from work expectations
    retired: boolean;             // true once the member has reached retirement age and opted in
    guardianId: string | null;
    phone: string | null;        // E.164, e.g. "+15551234567". null if no phone.
    pinHash: string | null;      // SHA-256 hex of PIN. null until set.
    passwordHash: string | null; // Argon2 hash of web password. null until set.
    languages: LanguageProficiency[];
    constructor(
        firstName: string,
        lastName: string,
        birthDate: Date,
        handle: string = "",
        disabled: boolean = false,
    ) {
        this.id = randomUUID();
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthDate = birthDate;
        this.joinDate = new Date();
        this.handle = handle.toLowerCase().replace(/[^a-z0-9_]/g, "");
        this.disabled = disabled;
        this.retired = false;
        this.guardianId = null;
        this.phone = null;
        this.pinHash = null;
        this.passwordHash = null;
        this.languages = [];
    }

    getId(): string { return this.id; }
    getDisplayName(): string { return `${this.firstName} ${this.lastName}`; }
    getHandle(): string { return this.handle; }
}
