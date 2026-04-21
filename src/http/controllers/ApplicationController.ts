import { Request, Response } from "express";
import { MemberApplication } from "../../member/MemberApplication.js";
import { ApplicationService } from "../../member/ApplicationService.js";
import { MemberService } from "../../member/MemberService.js";

function toDto(app: MemberApplication) {
    let reviewerName: string | null = null;
    if (app.reviewedBy) {
        const reviewer = MemberService.getInstance().get(app.reviewedBy);
        reviewerName = reviewer ? reviewer.getDisplayName() : null;
    }
    return {
        id:           app.id,
        firstName:    app.firstName,
        lastName:     app.lastName,
        birthDate:    app.birthDate.toISOString().slice(0, 10),
        handle:       app.handle || null,
        phone:        app.phone,
        note:         app.note,
        status:       app.status,
        submittedAt:  app.submittedAt.toISOString(),
        reviewedAt:   app.reviewedAt?.toISOString() ?? null,
        reviewedBy:   app.reviewedBy,
        reviewerName,
        reviewNote:   app.reviewNote,
        memberId:     app.memberId,
    };
}

// GET /applications?status=pending|approved|denied
export function listApplications(req: Request, res: Response): void {
    const { status } = req.query;
    let apps = ApplicationService.getInstance().getAll();
    if (typeof status === "string" && ["pending", "approved", "denied"].includes(status)) {
        apps = apps.filter(a => a.status === status);
    }
    res.json({ total: apps.length, applications: apps.map(toDto) });
}

// GET /applications/:id
export function getApplication(req: Request, res: Response): void {
    const app = ApplicationService.getInstance().get(req.params.id as string);
    if (!app) { res.status(404).json({ error: "Application not found" }); return; }
    res.json(toDto(app));
}

// POST /applications  — body: { firstName, lastName, birthDate, handle?, phone?, note? }
export function submitApplication(req: Request, res: Response): void {
    const { firstName, lastName, birthDate, handle, phone, note } = req.body ?? {};

    if (typeof firstName !== "string" || !firstName.trim()) {
        res.status(400).json({ error: "firstName is required" }); return;
    }
    if (typeof lastName !== "string" || !lastName.trim()) {
        res.status(400).json({ error: "lastName is required" }); return;
    }
    if (!birthDate || isNaN(Date.parse(birthDate))) {
        res.status(400).json({ error: "birthDate must be a valid ISO date string" }); return;
    }

    const app = new MemberApplication(
        firstName.trim(),
        lastName.trim(),
        new Date(birthDate),
        typeof handle === "string" ? handle : "",
        typeof phone  === "string" ? phone  : null,
        typeof note   === "string" ? note   : null,
    );
    ApplicationService.getInstance().submit(app);
    res.status(201).json(toDto(app));
}

// POST /applications/:id/approve  — body: { reviewedBy?, reviewNote? }
export function approveApplication(req: Request, res: Response): void {
    const { reviewedBy, reviewNote } = req.body ?? {};
    try {
        const member = ApplicationService.getInstance().approve(
            req.params.id as string,
            typeof reviewedBy === "string" ? reviewedBy : null,
            typeof reviewNote === "string" ? reviewNote : null,
        );
        const app = ApplicationService.getInstance().get(req.params.id as string)!;
        res.json({ application: toDto(app), memberId: member.id });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Approval failed";
        const status = msg.includes("not found") ? 404 : 409;
        res.status(status).json({ error: msg });
    }
}

// POST /applications/:id/deny  — body: { reviewedBy?, reviewNote? }
export function denyApplication(req: Request, res: Response): void {
    const { reviewedBy, reviewNote } = req.body ?? {};
    try {
        ApplicationService.getInstance().deny(
            req.params.id as string,
            typeof reviewedBy === "string" ? reviewedBy : null,
            typeof reviewNote === "string" ? reviewNote : null,
        );
        const app = ApplicationService.getInstance().get(req.params.id as string)!;
        res.json(toDto(app));
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Denial failed";
        const status = msg.includes("not found") ? 404 : 409;
        res.status(status).json({ error: msg });
    }
}
