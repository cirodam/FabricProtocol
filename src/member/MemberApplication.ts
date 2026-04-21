import { randomUUID } from "crypto";

export type ApplicationStatus = "pending" | "approved" | "denied";

/**
 * A MemberApplication represents a prospective member's request to join.
 * It captures their basic information and moves through a simple lifecycle:
 *
 *   submitted → pending → approved → (onboarded as Member)
 *                       → denied
 *
 * On approval, the application is linked to the created Member via memberId.
 * The application record is kept permanently as an audit trail.
 */
export class MemberApplication {
    readonly id: string;
    readonly submittedAt: Date;

    // Applicant information
    firstName: string;
    lastName: string;
    birthDate: Date;
    handle: string;
    phone: string | null;
    note: string | null;           // freeform text from the applicant

    // Review
    status: ApplicationStatus;
    reviewedAt: Date | null;
    reviewedBy: string | null;     // memberId of the officer who acted
    reviewNote: string | null;     // internal note from the reviewer

    // Set after approval + onboarding
    memberId: string | null;

    constructor(
        firstName: string,
        lastName: string,
        birthDate: Date,
        handle: string = "",
        phone: string | null = null,
        note: string | null = null,
    ) {
        this.id          = randomUUID();
        this.submittedAt = new Date();
        this.firstName   = firstName;
        this.lastName    = lastName;
        this.birthDate   = birthDate;
        this.handle      = handle.toLowerCase().replace(/[^a-z0-9_]/g, "");
        this.phone       = phone;
        this.note        = note;
        this.status      = "pending";
        this.reviewedAt  = null;
        this.reviewedBy  = null;
        this.reviewNote  = null;
        this.memberId    = null;
    }
}
