import { Request, Response } from "express";
import { Commonwealth } from "../../commons/Commonwealth.js";
import { LeaderPoolService } from "../../commons/sortition/LeaderPoolService.js";
import { DomainPoolAssignmentLoader } from "../../commons/domain/DomainPoolAssignmentLoader.js";
import { LeaderPool } from "../../commons/sortition/LeaderPool.js";
import { MemberService } from "../../member/MemberService.js";
import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";

let assignmentLoader: DomainPoolAssignmentLoader | null = null;

export function initDomainAssignmentLoader(loader: DomainPoolAssignmentLoader): void {
    assignmentLoader = loader;
}

function poolSnapshot(pool: LeaderPool | undefined) {
    if (!pool) return null;
    return {
        id:               pool.id,
        poolName:         pool.poolName,
        memberCount:      pool.memberCount,
        isActive:         pool.isActive,
        councilSeatCount: pool.councilSeatCount,
        councilVacancies: pool.councilVacancies,
    };
}

function domainToDto(domain: FunctionalDomain) {
    const pool = domain.poolId ? LeaderPoolService.getInstance().get(domain.poolId) : undefined;
    return {
        id:     domain.id,
        name:   domain.name,
        handle: domain.getHandle(),
        poolId: domain.poolId,
        pool:   poolSnapshot(pool),
    };
}

function persistAssignments(): void {
    if (!assignmentLoader) return;
    const assignments: Record<string, string> = {};
    for (const d of Commonwealth.getInstance().getDomains()) {
        if (d.poolId) assignments[d.id] = d.poolId;
    }
    assignmentLoader.save(assignments);
}

// GET /api/domains
export function listDomains(_req: Request, res: Response): void {
    const domains = Commonwealth.getInstance().getDomains().map(domainToDto);
    res.json({ domains });
}

// GET /api/domains/:id
export function getDomain(req: Request, res: Response): void {
    const domain = Commonwealth.getInstance().getDomains().find(d => d.id === req.params.id);
    if (!domain) { res.status(404).json({ error: "Domain not found" }); return; }

    const pool = domain.poolId ? LeaderPoolService.getInstance().get(domain.poolId) : undefined;
    const memberService = MemberService.getInstance();
    const councilSeats = pool ? pool.getCouncilSeats().map(s => {
        const m = memberService.get(s.memberId);
        return {
            memberId:  s.memberId,
            seatedAt:  s.seatedAt.toISOString(),
            firstName: m?.firstName ?? "Unknown",
            lastName:  m?.lastName ?? "",
            handle:    m?.handle ?? "",
        };
    }) : [];

    res.json({ ...domainToDto(domain), councilSeats });
}

// PATCH /api/domains/:id/pool  — body: { poolId } or { poolId: null }
export function setDomainPool(req: Request, res: Response): void {
    const domain = Commonwealth.getInstance().getDomains().find(d => d.id === req.params.id);
    if (!domain) { res.status(404).json({ error: "Domain not found" }); return; }

    const { poolId } = req.body ?? {};
    if (poolId !== null && poolId !== undefined) {
        if (typeof poolId !== "string" || !poolId.trim()) {
            res.status(400).json({ error: "poolId must be a non-empty string or null" }); return;
        }
        if (!LeaderPoolService.getInstance().get(poolId.trim())) {
            res.status(404).json({ error: "Leader pool not found" }); return;
        }
        domain.poolId = poolId.trim();
    } else {
        domain.poolId = null;
    }

    persistAssignments();
    res.json(domainToDto(domain));
}
