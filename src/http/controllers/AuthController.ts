import { Request, Response } from "express";
import { AuthService } from "../../auth/AuthService.js";

const service = () => AuthService.getInstance();

// POST /auth/login
// Body: { handle, password }
export function login(req: Request, res: Response): void {
    const { handle, password } = req.body ?? {};

    if (typeof handle !== "string" || !handle.trim()) {
        res.status(400).json({ error: "handle is required" });
        return;
    }
    if (typeof password !== "string" || !password) {
        res.status(400).json({ error: "password is required" });
        return;
    }

    const memberId = service().verify(handle.trim().toLowerCase(), password);
    if (!memberId) {
        res.status(401).json({ error: "Invalid handle or password" });
        return;
    }

    req.session.regenerate((err) => {
        if (err) {
            res.status(500).json({ error: "Session error" });
            return;
        }
        req.session.memberId = memberId;
        res.json({ memberId });
    });
}

// POST /auth/logout
export function logout(req: Request, res: Response): void {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({ error: "Could not end session" });
            return;
        }
        res.clearCookie("connect.sid");
        res.json({ ok: true });
    });
}

// POST /auth/create-account
// Body: { handle, password }
export function createAccount(req: Request, res: Response): void {
    const { handle, password } = req.body ?? {};

    if (typeof handle !== "string" || !handle.trim()) {
        res.status(400).json({ error: "handle is required" });
        return;
    }
    if (typeof password !== "string" || password.length < 8) {
        res.status(400).json({ error: "password must be at least 8 characters" });
        return;
    }

    const ok = service().setPassword(handle.trim().toLowerCase(), password);
    if (!ok) {
        res.status(404).json({ error: "No member with that handle" });
        return;
    }

    res.json({ ok: true });
}

// GET /auth/me
export function me(req: Request, res: Response): void {
    if (!req.session.memberId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
    }
    res.json({ memberId: req.session.memberId });
}
