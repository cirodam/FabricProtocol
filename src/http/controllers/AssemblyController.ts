import { Request, Response } from "express";
import { AssemblyService } from "../../commons/assembly/AssemblyService.js";
import { CitizensAssembly } from "../../commons/assembly/CitizensAssembly.js";
import { MemberService } from "../../member/MemberService.js";

function assemblyToDto(a: CitizensAssembly) {
    return {
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

    res.json({ ...assemblyToDto(assembly), seats });
}

// POST /assembly/draw  — fill vacancies from the full member roster
export function drawSeats(_req: Request, res: Response): void {
    const svc      = AssemblyService.getInstance();
    const assembly = svc.getOrCreate();

    const vacancies = assembly.vacancies;
    if (vacancies === 0) {
        res.status(409).json({ error: "Assembly is already full" }); return;
    }

    const memberService = MemberService.getInstance();
    const seated   = new Set(assembly.seatedMemberIds());
    const eligible = memberService.getAll().map(m => m.id).filter(id => !seated.has(id));
    const count    = Math.min(vacancies, eligible.length);
    for (let i = 0; i < count; i++) {
        const j = i + Math.floor(Math.random() * (eligible.length - i));
        [eligible[i], eligible[j]] = [eligible[j]!, eligible[i]!];
    }
    const drawn = eligible.slice(0, count);
    for (const memberId of drawn) assembly.addSeat(memberId);
    svc.save();

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
