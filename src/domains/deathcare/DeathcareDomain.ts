import { randomUUID } from "crypto";
import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

export type BodyDisposition = "natural_burial" | "cremation" | "other";

export class DeceasedRecord {
    readonly id: string;
    readonly memberId: string;
    readonly memberName: string;
    readonly diedAt: Date;
    disposition: BodyDisposition | null;
    dispositionAt: Date | null;
    notes: string;

    constructor(memberId: string, memberName: string, notes: string = "") {
        this.id = randomUUID();
        this.memberId = memberId;
        this.memberName = memberName;
        this.diedAt = new Date();
        this.disposition = null;
        this.dispositionAt = null;
        this.notes = notes;
    }

    get isHandled(): boolean {
        return this.disposition !== null;
    }
}

/**
 * The Deathcare domain ensures that deceased community members are handled with
 * dignity and that no body is left unattended.
 *
 * Proper handling of the dead is a basic public health obligation, not only a
 * cultural one. Improperly handled remains contaminate water supplies, attract
 * disease vectors, and in the case of infectious death, expose the living to
 * communicable illness. Historically, failure to manage the dead has been a
 * primary driver of epidemic spread — cholera, typhoid, and plague all propagate
 * through decomposing remains and the conditions they create. Deathcare workers
 * must have basic infection control knowledge, particularly when a death involves
 * a communicable disease.
 *
 * Natural burial is the default: sufficient depth, away from water sources,
 * ecologically sound, low-cost, and the oldest human practice. The domain
 * maintains burial grounds and ensures every death is recorded and every body
 * handled promptly.
 *
 * The domain coordinates with Healthcare on end-of-life care and infectious
 * precautions, and with MemberService on the discharge of deceased members.
 */
export class DeathcareDomain extends FunctionalDomain {
    private static readonly DOMAIN_ID = "00000000-0000-0000-0000-000000000014";
    private static instance: DeathcareDomain;

    private records: Map<string, DeceasedRecord> = new Map();

    private constructor() {
        super("Deathcare", "Ensures dignified handling of deceased community members and maintenance of burial grounds.", DeathcareDomain.DOMAIN_ID);
        this.addRole(new CommunityRole("Deathcare Coordinator", "Oversees burial grounds, handles deceased records, and coordinates with Healthcare on infectious precautions.", 700));
    }

    static getInstance(): DeathcareDomain {
        if (!DeathcareDomain.instance) {
            DeathcareDomain.instance = new DeathcareDomain();
        }
        return DeathcareDomain.instance;
    }

    registerDeath(memberId: string, memberName: string, notes: string = ""): DeceasedRecord {
        const record = new DeceasedRecord(memberId, memberName, notes);
        this.records.set(record.id, record);
        return record;
    }

    recordDisposition(recordId: string, disposition: BodyDisposition): void {
        const record = this.records.get(recordId);
        if (!record) throw new Error(`No deceased record ${recordId}`);
        record.disposition = disposition;
        record.dispositionAt = new Date();
    }

    /** Returns records where remains have not yet been handled. */
    getPendingDispositions(): DeceasedRecord[] {
        return Array.from(this.records.values()).filter(r => !r.isHandled);
    }

    getRecord(recordId: string): DeceasedRecord | undefined {
        return this.records.get(recordId);
    }

    getAll(): DeceasedRecord[] {
        return Array.from(this.records.values());
    }
}
