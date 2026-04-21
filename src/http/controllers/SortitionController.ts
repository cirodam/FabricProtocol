import { Request, Response } from "express";
import { SortitionService } from "../../commons/sortition/SortitionService.js";
import { SortitionPool } from "../../commons/sortition/SortitionPool.js";
import { MemberService } from "../../member/MemberService.js";

function poolToDto(pool: SortitionPool) {
    return {
        id:          pool.id,
        name:        pool.name,
        description: pool.description,
        memberCount: pool.memberCount,
        createdAt:   pool.createdAt.toISOString(),
    };
}

// GET /sortition/pools
export function listPools(_req: Request, res: Response): void {
    const pools = SortitionService.getInstance().getAllPools().map(poolToDto);
    res.json({ total: pools.length, pools });
}

// GET /sortition/pools/:id
export function getPool(req: Request, res: Response): void {
    const pool = SortitionService.getInstance().getPool(req.params.id as string);
    if (!pool) { res.status(404).json({ error: "Pool not found" }); return; }
    const memberService = MemberService.getInstance();
    const members = pool.getMembers().map(id => {
        const m = memberService.get(id);
        return {
            id,
            firstName: m?.firstName ?? "Unknown",
            lastName:  m?.lastName ?? "",
            handle:    m?.handle ?? "",
        };
    });
    res.json({ ...poolToDto(pool), members });
}

// POST /sortition/pools  — body: { name, description? }
export function createPool(req: Request, res: Response): void {
    const { name, description } = req.body ?? {};
    if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "name is required" }); return;
    }
    const pool = new SortitionPool(
        name.trim(),
        typeof description === "string" ? description.trim() : "",
    );
    SortitionService.getInstance().addPool(pool);
    res.status(201).json(poolToDto(pool));
}

// DELETE /sortition/pools/:id
export function deletePool(req: Request, res: Response): void {
    const removed = SortitionService.getInstance().removePool(req.params.id as string);
    if (!removed) { res.status(404).json({ error: "Pool not found" }); return; }
    res.status(204).send();
}

// POST /sortition/pools/:id/members  — body: { memberId }
export function addMember(req: Request, res: Response): void {
    const svc  = SortitionService.getInstance();
    const pool = svc.getPool(req.params.id as string);
    if (!pool) { res.status(404).json({ error: "Pool not found" }); return; }

    const { memberId } = req.body ?? {};
    if (typeof memberId !== "string" || !memberId.trim()) {
        res.status(400).json({ error: "memberId is required" }); return;
    }
    if (!MemberService.getInstance().get(memberId)) {
        res.status(404).json({ error: "Member not found" }); return;
    }
    if (pool.hasMember(memberId)) {
        res.status(409).json({ error: "Member already in pool" }); return;
    }
    pool.addMember(memberId);
    svc.savePool(pool);
    res.status(201).json(poolToDto(pool));
}

// DELETE /sortition/pools/:id/members/:memberId
export function removeMember(req: Request, res: Response): void {
    const svc  = SortitionService.getInstance();
    const pool = svc.getPool(req.params.id as string);
    if (!pool) { res.status(404).json({ error: "Pool not found" }); return; }

    const removed = pool.removeMember(req.params.memberId as string);
    if (!removed) { res.status(404).json({ error: "Member not in pool" }); return; }
    svc.savePool(pool);
    res.status(204).send();
}

// POST /sortition/pools/:id/draw  — body: { count }
export function drawMembers(req: Request, res: Response): void {
    const pool = SortitionService.getInstance().getPool(req.params.id as string);
    if (!pool) { res.status(404).json({ error: "Pool not found" }); return; }

    const count = parseInt(String((req.body ?? {}).count ?? "1"), 10);
    if (isNaN(count) || count < 1) {
        res.status(400).json({ error: "count must be a positive integer" }); return;
    }
    const memberService = MemberService.getInstance();
    const drawn = pool.draw(count).map(id => {
        const m = memberService.get(id);
        return {
            id,
            firstName: m?.firstName ?? "Unknown",
            lastName:  m?.lastName ?? "",
            handle:    m?.handle ?? "",
        };
    });
    res.json({ poolId: pool.id, requested: count, drawn });
}
