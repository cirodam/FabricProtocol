import { Request, Response } from "express";
import { Constitution } from "../../commons/Constitution.js";
import { GovernanceService } from "../../commons/GovernanceService.js";

// GET /api/constitution
export function getConstitution(_req: Request, res: Response): void {
    res.json(Constitution.getInstance().toDocument());
}

// PATCH /api/constitution/name
export function setCommunityName(req: Request, res: Response): void {
    const { name } = req.body as { name?: unknown };
    if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "name must be a non-empty string" });
        return;
    }
    try {
        GovernanceService.getInstance().setCommunityName(name);
        res.json({ communityName: Constitution.getInstance().communityName });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
}
