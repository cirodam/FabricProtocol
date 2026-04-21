import { Request, Response } from "express";
import { Constitution } from "../../commons/Constitution.js";

// GET /constitution
export function getConstitution(_req: Request, res: Response): void {
    res.json(Constitution.getInstance().toDocument());
}
