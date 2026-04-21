import { MemberApplication } from "./MemberApplication.js";
import { MemberApplicationLoader } from "./MemberApplicationLoader.js";
import { MemberService } from "./MemberService.js";
import { Member } from "./Member.js";

export class ApplicationService {
    private static instance: ApplicationService;

    private applications: Map<string, MemberApplication> = new Map();
    private loader: MemberApplicationLoader | null = null;

    private constructor() {}

    static getInstance(): ApplicationService {
        if (!ApplicationService.instance) {
            ApplicationService.instance = new ApplicationService();
        }
        return ApplicationService.instance;
    }

    init(loader: MemberApplicationLoader): void {
        this.loader = loader;
        for (const app of loader.loadAll()) {
            this.applications.set(app.id, app);
        }
    }

    submit(app: MemberApplication): void {
        this.applications.set(app.id, app);
        this.loader?.save(app);
    }

    get(id: string): MemberApplication | undefined {
        return this.applications.get(id);
    }

    getAll(): MemberApplication[] {
        return Array.from(this.applications.values())
            .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    }

    getPending(): MemberApplication[] {
        return this.getAll().filter(a => a.status === "pending");
    }

    /**
     * Approve an application and immediately onboard the applicant as a Member.
     * Returns the newly created Member.
     */
    approve(id: string, reviewedBy: string | null, reviewNote: string | null = null): Member {
        const app = this.applications.get(id);
        if (!app) throw new Error(`Application ${id} not found`);
        if (app.status !== "pending") throw new Error(`Application is already ${app.status}`);

        const member = new Member(
            app.firstName,
            app.lastName,
            app.birthDate,
            app.handle,
        );
        if (app.phone) member.phone = app.phone;

        MemberService.getInstance().add(member);

        app.status     = "approved";
        app.reviewedAt = new Date();
        app.reviewedBy = reviewedBy;
        app.reviewNote = reviewNote;
        app.memberId   = member.id;
        this.loader?.save(app);

        return member;
    }

    /**
     * Deny an application.
     */
    deny(id: string, reviewedBy: string | null, reviewNote: string | null = null): void {
        const app = this.applications.get(id);
        if (!app) throw new Error(`Application ${id} not found`);
        if (app.status !== "pending") throw new Error(`Application is already ${app.status}`);

        app.status     = "denied";
        app.reviewedAt = new Date();
        app.reviewedBy = reviewedBy;
        app.reviewNote = reviewNote;
        this.loader?.save(app);
    }
}
