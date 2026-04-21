import { Request, Response } from "express";
import { AssemblyService } from "../../commons/assembly/AssemblyService.js";
import { CitizensAssembly } from "../../commons/assembly/CitizensAssembly.js";
import { SortitionService } from "../../commons/sortition/SortitionService.js";
import { MemberService } from "../../member/MemberService.js";

function assemblyToDto(a: CitizensAssembly) {
    return {
        poolId:    a.poolId,
        size:      CitizensAssembly.SIZE,
        seatCount: a.seatCount,
        vacancies: a.vacancies,
    };
}

// GET /assembly
export function getAssembly(_req: Request, res: Response): void {
    const svc      = AssemblyService.getInstance();
    const assembly = svc.getOrCreate();
    const memberService = MemberService.getInstance();

    const seats = assembly.getSeats().map(s => {
        const m = memberService.get(s.memberId);
        return {
            memberId:  s.memberId,
            seatedAt:  s.seatedAt.toISOString(),
            firstName: m?.firstName ?? "Unknown",
            lastName:  m?.lastName  ?? "",
            handle:    m?.handle    ?? "",
        };
    });

    const pool = assembly.poolId
        ? SortitionService.getInstance().getPool(assembly.poolId)
        : null;

    res.json({ ...assemblyToDto(assembly), seats, poolName: pool?.name ?? null });
}

// PATCH /assembly/pool  — body: { poolId: string | null }
export function setPool(req: Request, res: Response): void {
    const svc      = AssemblyService.getInstance();
    const assembly = svc.getOrCreate();
    const { poolId } = req.body ?? {};

    if (poolId !== null && poolId !== undefined) {
        if (typeof poolId !== "string" || !poolId.trim()) {
            res.status(400).json({ error: "poolId must be a non-empty string or null" }); return;
        }
        if (!SortitionService.getInstance().getPool(poolId)) {
            res.status(404).json({ error: "Sortition pool not found" }); return;
        }
        assembly.poolId = poolId.trim();
    } else {
        assembly.poolId = null;
    }
    svc.save();
    res.json(assemblyToDto(assembly));
}

// POST /assembly/draw  — fill vacancies from the linked pool
export function drawSeats(_req: Request, res: Response): void {
    const svc      = AssemblyService.getInstance();
    const assembly = svc.getOrCreate();

    if (!assembly.poolId) {
        res.status(409).json({ error: "No sortition pool linked to the assembly" }); return;
    }
    const pool = SortitionService.getInstance().getPool(assembly.poolId);
    if (!pool) {
        res.status(404).json({ error: "Linked sortition pool not found" }); return;
    }

    const vacancies = assembly.vacancies;
    if (vacancies === 0) {
        res.status(409).json({ error: "Assembly is already full" }); return;
    }

    const seated   = new Set(assembly.seatedMemberIds());
    const eligible = pool.getMembers().filter(id => !seated.has(id));
    const count    = Math.min(vacancies, eligible.length);
    for (let i = 0; i < count; i++) {
        const j = i + Math.floor(Math.random() * (eligible.length - i));
        [eligible[i], eligible[j]] = [eligible[j]!, eligible[i]!];
    }
    const drawn = eligible.slice(0, count);
    for (const memberId of drawn) assembly.addSeat(memberId);
    svc.save();

    const memberService = MemberService.getInstance();
    res.json({
        ...assemblyToDto(assembly),
        drawn: drawn.map(id => {
            const m = memberService.get(id);
            return { id, firstName: m?.firstName ?? "Unknown", lastName: m?.lastName ?? "", handle: m?.handle ?? "" };
        }),
    });
}

// DELETE /assembly/seats/:memberId
export function vacateSeat(req: Request, res: Response): void {
    const svc      = AssemblyService.getInstance();
    const assembly = svc.getOrCreate();
    const removed  = assembly.vacateSeat(req.params.memberId as string);
    if (!removed) { res.status(404).json({ error: "Member not seated" }); return; }
    svc.save();
    res.status(204).send();
}
