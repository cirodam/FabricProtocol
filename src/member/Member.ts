import {
    randomUUID,
    generateKeyPairSync,
    sign as signEd25519,
    createPrivateKey,
    createHash,
    type KeyObject,
} from "crypto";
import { IEconomicActor } from "../IEconomicActor.js";

export interface LanguageProficiency {
    language: string;   // BCP 47, e.g. "en", "es", "zh-Hans"
    reading: boolean;
    writing: boolean;
    speaking: boolean;
}

export class Member implements IEconomicActor {

    readonly id: string;
    readonly joinDate: Date;

    firstName: string;
    lastName: string;
    birthDate: Date;
    handle: string;              // lowercase alphanumeric + underscores, unique in community
    disabled: boolean;           // community-determined; exempt from work expectations
    retired: boolean;            // true once the member has reached retirement age and opted in
    guardianId: string | null;
    phone: string | null;        // E.164, e.g. "+15551234567". null if no phone.
    languages: LanguageProficiency[];

    private _pinHash: string | null = null;
    private _passwordHash: string | null = null;

    private _privateKey: KeyObject;
    private _privateKeyDer: string;
    private _publicKeyHex: string;
    private _nullifier: string;

    constructor(
        firstName: string,
        lastName: string,
        birthDate: Date,
        handle: string = "",
        disabled: boolean = false,
        guardianId: string | null = null,
        phone: string | null = null,
        languages: LanguageProficiency[] = [],
    ) {
        this.id = randomUUID();
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthDate = birthDate;
        this.joinDate = new Date();
        this.handle = handle.toLowerCase().replace(/[^a-z0-9_]/g, "");
        this.disabled = disabled;
        this.retired = false;
        this.guardianId = guardianId;
        this.phone = phone;
        this.languages = languages;

        const { privateKey, publicKey } = generateKeyPairSync("ed25519");
        this._privateKey = privateKey;
        this._privateKeyDer = privateKey.export({ type: "pkcs8", format: "der" }).toString("hex");
        this._publicKeyHex = publicKey.export({ type: "spki", format: "der" }).toString("hex");
        this._nullifier = createHash("sha256").update(this._privateKeyDer).digest("hex");
    }

    /**
     * Reconstruct a Member from a persisted record.
     * Only for use by MemberLoader.
     */
    static restore(record: {
        id: string;
        firstName: string;
        lastName: string;
        birthDate: Date;
        joinDate: Date;
        handle: string;
        disabled: boolean;
        retired: boolean;
        guardianId: string | null;
        phone: string | null;
        pinHash: string | null;
        passwordHash: string | null;
        privateKeyDer: string | null;
        publicKeyHex: string | null;
        languages: LanguageProficiency[];
    }): Member {
        const m = new Member(
            record.firstName,
            record.lastName,
            record.birthDate,
            record.handle,
            record.disabled,
            record.guardianId,
            record.phone,
            record.languages,
        );
        (m as unknown as Record<string, unknown>)["id"] = record.id;
        (m as unknown as Record<string, unknown>)["joinDate"] = record.joinDate;
        m.retired = record.retired;
        m._pinHash = record.pinHash;
        m._passwordHash = record.passwordHash;
        if (record.privateKeyDer && record.publicKeyHex) {
            m._privateKey = createPrivateKey({
                key: Buffer.from(record.privateKeyDer, "hex"),
                format: "der",
                type: "pkcs8",
            });
            m._privateKeyDer = record.privateKeyDer;
            m._publicKeyHex = record.publicKeyHex;
            m._nullifier = createHash("sha256").update(record.privateKeyDer).digest("hex");
        }
        return m;
    }

    getId(): string { return this.id; }
    getDisplayName(): string { return `${this.firstName} ${this.lastName}`; }
    getHandle(): string { return this.handle; }

    // ── Identity (Ed25519 keypair) ─────────────────────────────────────────────
    // The community holds this keypair in custody on behalf of the member.
    // The member can request their private key at any time (custody handoff).

    /** Hex-encoded SPKI DER public key. Safe to share with the federation. */
    get publicKeyHex(): string { return this._publicKeyHex; }

    /**
     * Nullifier: SHA-256(privateKeyDer).
     * Submitted to a federation registry to detect double-membership without
     * revealing the member's identity.
     */
    get nullifier(): string { return this._nullifier; }

    /**
     * Export the private key on explicit member request (custody handoff).
     * Returns hex-encoded PKCS8 DER.
     */
    exportPrivateKey(): string { return this._privateKeyDer; }

    /**
     * Sign an arbitrary message on behalf of the member.
     * Returns a hex-encoded Ed25519 signature.
     */
    sign(message: string): string {
        return signEd25519(null, Buffer.from(message, "utf-8"), this._privateKey).toString("hex");
    }

    /** @internal Only for use by MemberLoader. */
    getKeypairForPersistence(): { privateKeyDer: string; publicKeyHex: string } {
        return { privateKeyDer: this._privateKeyDer, publicKeyHex: this._publicKeyHex };
    }

    // ── Credential management ─────────────────────────────────────────────────
    // Hash values are never exposed. MemberService owns all pin/password logic.

    /** @internal Only call from MemberService. */
    setPinHash(hash: string | null): void { this._pinHash = hash; }

    /** @internal Only call from MemberService. */
    setPasswordHash(hash: string | null): void { this._passwordHash = hash; }

    /** Returns true if the given hash matches the stored pin hash. */
    matchesPinHash(hash: string): boolean {
        return this._pinHash !== null && this._pinHash === hash;
    }

    /** Returns true if the given hash matches the stored password hash. */
    matchesPasswordHash(hash: string): boolean {
        return this._passwordHash !== null && this._passwordHash === hash;
    }

    /** Returns true if this member has a pin set. */
    hasPin(): boolean { return this._pinHash !== null; }

    /** Returns true if this member has a web password set. */
    hasPassword(): boolean { return this._passwordHash !== null; }

    /**
     * Returns credential hashes for persistence. Only for use by MemberLoader.
     * @internal
     */
    getCredentialsForPersistence(): { pinHash: string | null; passwordHash: string | null } {
        return { pinHash: this._pinHash, passwordHash: this._passwordHash };
    }

    /**
     * Exclude sensitive fields from JSON serialization.
     * Prevents accidental credential leakage via res.json(member).
     */
    toJSON() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            birthDate: this.birthDate,
            joinDate: this.joinDate,
            handle: this.handle,
            disabled: this.disabled,
            retired: this.retired,
            guardianId: this.guardianId,
            phone: this.phone,
            languages: this.languages,
            publicKeyHex: this._publicKeyHex,
            nullifier: this._nullifier,
        };
    }
}
