import { Request, Response } from "express";
import { MemberService } from "../../member/MemberService.js";
import { AuthService } from "../../auth/AuthService.js";
import { Member } from "../../member/Member.js";

// GET /api/setup
export function getSetupStatus(_req: Request, res: Response): void {
    res.json({ isSetup: MemberService.getInstance().count() > 0 });
}

// POST /api/setup
// Body: { firstName, lastName, birthDate, handle, password }
// Creates the first member (community organizer) and logs them in.
// Returns 409 if already set up.
export function setup(req: Request, res: Response): void {
    if (MemberService.getInstance().count() > 0) {
        res.status(409).json({ error: "Community is already set up" });
        return;
    }

    const { firstName, lastName, birthDate, handle, password } = req.body ?? {};

    if (typeof firstName !== "string" || !firstName.trim()) {
        res.status(400).json({ error: "firstName is required" }); return;
    }
    if (typeof lastName !== "string" || !lastName.trim()) {
        res.status(400).json({ error: "lastName is required" }); return;
    }
    if (typeof birthDate !== "string" || !birthDate.trim()) {
        res.status(400).json({ error: "birthDate is required" }); return;
    }
    if (typeof handle !== "string" || !handle.trim()) {
        res.status(400).json({ error: "handle is required" }); return;
    }
    if (typeof password !== "string" || password.length < 8) {
        res.status(400).json({ error: "password must be at least 8 characters" }); return;
    }

    const dob = new Date(birthDate);
    if (isNaN(dob.getTime())) {
        res.status(400).json({ error: "birthDate is invalid" }); return;
    }

    const member = new Member(
        firstName.trim(),
        lastName.trim(),
        dob,
        handle.trim().toLowerCase(),
    );

    MemberService.getInstance().add(member);
    AuthService.getInstance().setPassword(member.handle, password);

    req.session.regenerate((err) => {
        if (err) {
            res.status(500).json({ error: "Session error" });
            return;
        }
        req.session.memberId = member.id;
        res.status(201).json({ memberId: member.id, handle: member.handle });
    });
}
