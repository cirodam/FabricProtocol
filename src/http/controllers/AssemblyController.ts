import { Request, Response } from "express";
import { AssemblyService } from "../../commons/assembly/AssemblyService.js";
import { CitizensAssembly } from "../../commons/assembly/CitizensAssembly.js";
import { MemberService } from "../../member/MemberService.js";

function assemblyToDto(a: CitizensAssembly, activeMemberCount: number) {
    return {
        targetSize: CitizensAssembly.targetSize(activeMemberCount),
        termMonths: a.termMonths,
        seatCount:  a.seatCount,
        vacancies:  a.vacanciesFor(activeMemberCount),
    };
}

// GET /assembly
export function getAssembly(_req: Request, res: Response): void {
    const svc           = AssemblyService.getInstance();
    const assembly      = svc.getOrCreate();
    const memberService = MemberService.getInstance();
    const allMembers    = memberService.getAll();

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

    res.json({ ...assemblyToDto(assembly, allMembers.length), seats });
}

// POST /assembly/draw  — fill vacancies from the full member roster
export function drawSeats(_req: Request, res: Response): void {
    const svc           = AssemblyService.getInstance();
    const memberService = MemberService.getInstance();
    const allMemberIds  = memberService.getAll().map(m => m.id);

    const assembly  = svc.getOrCreate();
    if (assembly.vacanciesFor(allMemberIds.length) === 0) {
        res.status(409).json({ error: "Assembly is already full" }); return;
    }

    const drawn = svc.draw(allMemberIds);
    res.json({
        ...assemblyToDto(assembly, allMemberIds.length),
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
