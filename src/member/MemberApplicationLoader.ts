import { MemberApplication } from "./MemberApplication.js";
import { FileStore } from "../storage/FileStore.js";

interface ApplicationRecord {
    id: string;
    submittedAt: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    handle: string;
    phone: string | null;
    note: string | null;
    status: "pending" | "approved" | "denied";
    reviewedAt: string | null;
    reviewedBy: string | null;
    reviewNote: string | null;
    memberId: string | null;
}

export class MemberApplicationLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(app: MemberApplication): void {
        const record: ApplicationRecord = {
            id:          app.id,
            submittedAt: app.submittedAt.toISOString(),
            firstName:   app.firstName,
            lastName:    app.lastName,
            birthDate:   app.birthDate.toISOString(),
            handle:      app.handle,
            phone:       app.phone,
            note:        app.note,
            status:      app.status,
            reviewedAt:  app.reviewedAt?.toISOString() ?? null,
            reviewedBy:  app.reviewedBy,
            reviewNote:  app.reviewNote,
            memberId:    app.memberId,
        };
        this.store.write(app.id, record);
    }

    loadAll(): MemberApplication[] {
        return this.store.readAll<ApplicationRecord>().map(r => this.fromRecord(r));
    }

    delete(id: string): boolean {
        return this.store.delete(id);
    }

    private fromRecord(r: ApplicationRecord): MemberApplication {
        const app = new MemberApplication(
            r.firstName,
            r.lastName,
            new Date(r.birthDate),
            r.handle,
            r.phone,
            r.note,
        );
        (app as unknown as Record<string, unknown>)["id"]          = r.id;
        (app as unknown as Record<string, unknown>)["submittedAt"] = new Date(r.submittedAt);
        app.status     = r.status;
        app.reviewedAt = r.reviewedAt ? new Date(r.reviewedAt) : null;
        app.reviewedBy = r.reviewedBy;
        app.reviewNote = r.reviewNote;
        app.memberId   = r.memberId;
        return app;
    }
}
