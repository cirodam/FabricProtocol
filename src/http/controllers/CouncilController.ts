import { Request, Response } from "express";
import { CouncilService } from "../../commons/council/CouncilService.js";
import { DomainCouncil } from "../../commons/council/DomainCouncil.js";
import { SortitionService } from "../../commons/sortition/SortitionService.js";
import { MemberService } from "../../member/MemberService.js";

function councilToDto(c: DomainCouncil) {
    return {
        domainId:   c.domainId,
        domainName: c.domainName,
        poolId:     c.poolId,
        size:       DomainCouncil.SIZE,
        seatCount:  c.seatCount,
        vacancies:  c.vacancies,
    };
}

// GET /councils
export function listCouncils(_req: Request, res: Response): void {
    const councils = CouncilService.getInstance().getAllCouncils().map(councilToDto);
    res.json({ total: councils.length, councils });
}

// GET /councils/:domainId
export function getCouncil(req: Request, res: Response): void {
    const council = CouncilService.getInstance().getCouncil(req.params.domainId as string);
    if (!council) { res.status(404).json({ error: "Council not found" }); return; }
    const memberService = MemberService.getInstance();
    const seats = council.getSeats().map(s => {
        const m = memberService.get(s.memberId);
        return {
            memberId:  s.memberId,
            seatedAt:  s.seatedAt.toISOString(),
            firstName: m?.firstName ?? "Unknown",
            lastName:  m?.lastName ?? "",
            handle:    m?.handle ?? "",
        };
    });
    const pool = council.poolId ? SortitionService.getInstance().getPool(council.poolId) : null;
    res.json({
        ...councilToDto(council),
        seats,
        poolName: pool?.name ?? null,
    });
}

// PATCH /councils/:domainId/pool  — body: { poolId } (or null to unlink)
export function setPool(req: Request, res: Response): void {
    const svc     = CouncilService.getInstance();
    const council = svc.getCouncil(req.params.domainId as string);
    if (!council) { res.status(404).json({ error: "Council not found" }); return; }

    const { poolId } = req.body ?? {};
    if (poolId !== null && poolId !== undefined) {
        if (typeof poolId !== "string" || !poolId.trim()) {
            res.status(400).json({ error: "poolId must be a non-empty string or null" }); return;
        }
        if (!SortitionService.getInstance().getPool(poolId)) {
            res.status(404).json({ error: "Sortition pool not found" }); return;
        }
        council.poolId = poolId.trim();
    } else {
        council.poolId = null;
    }
    svc.saveCouncil(council);
    res.json(councilToDto(council));
}

// POST /councils/:domainId/draw  — fill empty seats from the linked pool
export function drawSeats(req: Request, res: Response): void {
    const svc     = CouncilService.getInstance();
    const council = svc.getCouncil(req.params.domainId as string);
    if (!council) { res.status(404).json({ error: "Council not found" }); return; }

    if (!council.poolId) {
        res.status(409).json({ error: "No sortition pool linked to this council" }); return;
    }
    const pool = SortitionService.getInstance().getPool(council.poolId);
    if (!pool) { res.status(404).json({ error: "Linked sortition pool not found" }); return; }

    const vacancies = council.vacancies;
    if (vacancies === 0) {
        res.status(409).json({ error: "Council is already full" }); return;
    }

    const seated   = new Set(council.seatedMemberIds());
    const eligible = pool.getMembers().filter(id => !seated.has(id));
    const count    = Math.min(vacancies, eligible.length);
    for (let i = 0; i < count; i++) {
        const j = i + Math.floor(Math.random() * (eligible.length - i));
        [eligible[i], eligible[j]] = [eligible[j]!, eligible[i]!];
    }
    const drawn = eligible.slice(0, count);
    for (const memberId of drawn) council.addSeat(memberId);
    svc.saveCouncil(council);

    const memberService = MemberService.getInstance();
    res.json({
        ...councilToDto(council),
        drawn: drawn.map(id => {
            const m = memberService.get(id);
            return { id, firstName: m?.firstName ?? "Unknown", lastName: m?.lastName ?? "", handle: m?.handle ?? "" };
        }),
    });
}

// DELETE /councils/:domainId/seats/:memberId
export function vacateSeat(req: Request, res: Response): void {
    const svc     = CouncilService.getInstance();
    const council = svc.getCouncil(req.params.domainId as string);
    if (!council) { res.status(404).json({ error: "Council not found" }); return; }
    const removed = council.vacateSeat(req.params.memberId as string);
    if (!removed) { res.status(404).json({ error: "Member not seated" }); return; }
    svc.saveCouncil(council);
    res.status(204).send();
}
