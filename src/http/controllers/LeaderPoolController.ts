import { Request, Response } from "express";
import { LeaderPoolService } from "../../commons/sortition/LeaderPoolService.js";
import { LeaderPool } from "../../commons/sortition/LeaderPool.js";
import { MemberService } from "../../member/MemberService.js";

function poolToDto(pool: LeaderPool) {
    return {
        id:                  pool.id,
        poolName:            pool.poolName,
        memberCount:         pool.memberCount,
        createdAt:           pool.createdAt.toISOString(),
        isActive:            pool.isActive,
        councilSize:         LeaderPool.COUNCIL_SIZE,
        activationThreshold: LeaderPool.ACTIVATION_THRESHOLD,
        councilSeatCount:    pool.councilSeatCount,
        councilVacancies:    pool.councilVacancies,
    };
}

// GET /leader-pools
export function listLeaderPools(_req: Request, res: Response): void {
    const pools = LeaderPoolService.getInstance().getAll().map(poolToDto);
    res.json({ total: pools.length, pools });
}

// GET /leader-pools/:id
export function getLeaderPool(req: Request, res: Response): void {
    const pool = LeaderPoolService.getInstance().get(req.params.id as string);
    if (!pool) { res.status(404).json({ error: "Leader pool not found" }); return; }
    pool.clearExpiredCouncilSeats();
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
    const councilSeats = pool.getCouncilSeats().map(s => {
        const m = memberService.get(s.memberId);
        return {
            memberId:  s.memberId,
            seatedAt:  s.seatedAt.toISOString(),
            firstName: m?.firstName ?? "Unknown",
            lastName:  m?.lastName ?? "",
            handle:    m?.handle ?? "",
        };
    });
    res.json({ ...poolToDto(pool), members, councilSeats });
}

// POST /leader-pools  — body: { poolName }
export function createLeaderPool(req: Request, res: Response): void {
    const { poolName } = req.body ?? {};
    if (typeof poolName !== "string" || !poolName.trim()) {
        res.status(400).json({ error: "poolName is required" }); return;
    }
    const pool = new LeaderPool(poolName.trim());
    LeaderPoolService.getInstance().add(pool);
    res.status(201).json(poolToDto(pool));
}

// DELETE /leader-pools/:id
export function deleteLeaderPool(req: Request, res: Response): void {
    const removed = LeaderPoolService.getInstance().remove(req.params.id as string);
    if (!removed) { res.status(404).json({ error: "Leader pool not found" }); return; }
    res.status(204).send();
}

// POST /leader-pools/:id/members  — body: { memberId }
export function addMember(req: Request, res: Response): void {
    const svc  = LeaderPoolService.getInstance();
    const pool = svc.get(req.params.id as string);
    if (!pool) { res.status(404).json({ error: "Leader pool not found" }); return; }

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
    svc.save(pool);
    res.status(201).json(poolToDto(pool));
}

// DELETE /leader-pools/:id/members/:memberId
export function removeMember(req: Request, res: Response): void {
    const svc  = LeaderPoolService.getInstance();
    const pool = svc.get(req.params.id as string);
    if (!pool) { res.status(404).json({ error: "Leader pool not found" }); return; }

    const removed = pool.removeMember(req.params.memberId as string);
    if (!removed) { res.status(404).json({ error: "Member not in pool" }); return; }
    svc.save(pool);
    res.status(204).send();
}

// POST /leader-pools/:id/draw  — body: { count }
export function drawMembers(req: Request, res: Response): void {
    const pool = LeaderPoolService.getInstance().get(req.params.id as string);
    if (!pool) { res.status(404).json({ error: "Leader pool not found" }); return; }

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
    res.json({ drawn });
}

// POST /leader-pools/:id/council/draw  — fill vacant council seats by sortition
export function drawCouncilSeats(req: Request, res: Response): void {
    const svc  = LeaderPoolService.getInstance();
    const pool = svc.get(req.params.id as string);
    if (!pool) { res.status(404).json({ error: "Leader pool not found" }); return; }
    if (!pool.isActive) {
        res.status(409).json({
            error: `Pool must have more than ${LeaderPool.ACTIVATION_THRESHOLD} members to draw council seats`,
        }); return;
    }
    if (pool.councilVacancies === 0) {
        res.status(409).json({ error: "Council is already full" }); return;
    }
    pool.clearExpiredCouncilSeats();
    const drawn = pool.drawCouncilSeats();
    svc.save(pool);
    const memberService = MemberService.getInstance();
    res.json({
        ...poolToDto(pool),
        drawn: drawn.map(id => {
            const m = memberService.get(id);
            return { id, firstName: m?.firstName ?? "Unknown", lastName: m?.lastName ?? "", handle: m?.handle ?? "" };
        }),
    });
}

// DELETE /leader-pools/:id/council/seats/:memberId
export function vacateCouncilSeat(req: Request, res: Response): void {
    const svc  = LeaderPoolService.getInstance();
    const pool = svc.get(req.params.id as string);
    if (!pool) { res.status(404).json({ error: "Leader pool not found" }); return; }
    const removed = pool.vacateCouncilSeat(req.params.memberId as string);
    if (!removed) { res.status(404).json({ error: "Member not seated" }); return; }
    svc.save(pool);
    res.status(204).send();
}
