import { Request, Response } from "express";
import { projectPopulation } from "../../projection/PopulationProjection.js";
import { MemberService } from "../../member/MemberService.js";

/**
 * GET /api/projection?size=N
 *
 * Project community needs for a population of N members.
 * If `size` is omitted, uses the current live membership count.
 */
export function getProjection(req: Request, res: Response): void {
    const rawSize = req.query["size"];
    let size: number;

    if (rawSize === undefined || rawSize === "") {
        size = MemberService.getInstance().count();
    } else {
        size = parseInt(String(rawSize), 10);
        if (!Number.isFinite(size) || size <= 0) {
            res.status(400).json({ error: "size must be a positive integer" });
            return;
        }
    }

    if (size === 0) {
        res.status(400).json({ error: "No members — provide a ?size= to project a hypothetical population" });
        return;
    }

    res.json(projectPopulation(size));
}
