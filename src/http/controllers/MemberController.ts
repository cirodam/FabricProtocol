import { Request, Response } from "express";
import { Member, LanguageProficiency } from "../../member/Member.js";
import { MemberService } from "../../member/MemberService.js";

const service = () => MemberService.getInstance();

// GET /members
export function listMembers(_req: Request, res: Response): void {
    const members = service().getAll().map(toDto);
    res.json(members);
}

// GET /members/:id
export function getMember(req: Request, res: Response): void {
    const member = service().get(req.params.id as string);
    if (!member) {
        res.status(404).json({ error: "Member not found" });
        return;
    }
    res.json(toDto(member));
}

// POST /members
// Body: { firstName, lastName, birthDate, physicalCapacity, cognitiveCapacity, handle?, guardianId?, phone?, languages? }
export function createMember(req: Request, res: Response): void {
    const { firstName, lastName, birthDate, physicalCapacity, cognitiveCapacity, handle, guardianId, phone, languages } = req.body ?? {};

    if (typeof firstName !== "string" || !firstName.trim()) {
        res.status(400).json({ error: "firstName is required" });
        return;
    }
    if (typeof lastName !== "string" || !lastName.trim()) {
        res.status(400).json({ error: "lastName is required" });
        return;
    }
    if (!birthDate || isNaN(Date.parse(birthDate))) {
        res.status(400).json({ error: "birthDate must be a valid ISO date string" });
        return;
    }
    if (typeof physicalCapacity !== "number" || physicalCapacity < 0 || physicalCapacity > 1) {
        res.status(400).json({ error: "physicalCapacity must be a number between 0 and 1" });
        return;
    }
    if (typeof cognitiveCapacity !== "number" || cognitiveCapacity < 0 || cognitiveCapacity > 1) {
        res.status(400).json({ error: "cognitiveCapacity must be a number between 0 and 1" });
        return;
    }
    if (handle !== undefined && typeof handle !== "string") {
        res.status(400).json({ error: "handle must be a string" });
        return;
    }
    if (guardianId !== undefined && typeof guardianId !== "string") {
        res.status(400).json({ error: "guardianId must be a string" });
        return;
    }
    if (phone !== undefined && typeof phone !== "string") {
        res.status(400).json({ error: "phone must be an E.164 string" });
        return;
    }

    const member = new Member(
        firstName.trim(),
        lastName.trim(),
        new Date(birthDate),
        physicalCapacity,
        cognitiveCapacity,
        handle || undefined,
    );
    if (guardianId) member.guardianId = guardianId;
    if (phone) member.phone = phone;
    if (Array.isArray(languages)) member.languages = (languages as LanguageProficiency[]);

    service().add(member);
    res.status(201).json(toDto(member));
}

// PATCH /members/:id
// Body: any subset of { firstName, lastName, phone, physicalCapacity, cognitiveCapacity, languages }
export function updateMember(req: Request, res: Response): void {
    const member = service().get(req.params.id as string);
    if (!member) {
        res.status(404).json({ error: "Member not found" });
        return;
    }

    const { firstName, lastName, phone, physicalCapacity, cognitiveCapacity, languages } = req.body ?? {};

    if (firstName !== undefined) {
        if (typeof firstName !== "string" || !firstName.trim()) {
            res.status(400).json({ error: "firstName must be a non-empty string" });
            return;
        }
        member.firstName = firstName.trim();
    }
    if (lastName !== undefined) {
        if (typeof lastName !== "string" || !lastName.trim()) {
            res.status(400).json({ error: "lastName must be a non-empty string" });
            return;
        }
        member.lastName = lastName.trim();
    }
    if (phone !== undefined) {
        if (phone !== null && typeof phone !== "string") {
            res.status(400).json({ error: "phone must be an E.164 string or null" });
            return;
        }
        member.phone = phone;
    }
    if (physicalCapacity !== undefined) {
        if (typeof physicalCapacity !== "number" || physicalCapacity < 0 || physicalCapacity > 1) {
            res.status(400).json({ error: "physicalCapacity must be a number between 0 and 1" });
            return;
        }
        member.physicalCapacity = physicalCapacity;
    }
    if (cognitiveCapacity !== undefined) {
        if (typeof cognitiveCapacity !== "number" || cognitiveCapacity < 0 || cognitiveCapacity > 1) {
            res.status(400).json({ error: "cognitiveCapacity must be a number between 0 and 1" });
            return;
        }
        member.cognitiveCapacity = cognitiveCapacity;
    }

    if (languages !== undefined) {
        if (!Array.isArray(languages)) {
            res.status(400).json({ error: "languages must be an array" });
            return;
        }
        member.languages = languages as LanguageProficiency[];
    }

    // Persist the changes
    MemberService.getInstance().save(member);

    res.json(toDto(member));
}

function toDto(m: Member) {
    return {
        id:                 m.id,
        firstName:          m.firstName,
        lastName:           m.lastName,
        birthDate:          m.birthDate.toISOString(),
        joinDate:           m.joinDate.toISOString(),
        handle:             m.handle,
        trustScore:         m.trustScore,
        physicalCapacity:   m.physicalCapacity,
        cognitiveCapacity:  m.cognitiveCapacity,
        guardianId:         m.guardianId,
        phone:              m.phone,
        languages:          m.languages,
    };
}

// DELETE /members/:id
export function deleteMember(req: Request, res: Response): void {
    const member = service().get(req.params.id as string);
    if (!member) {
        res.status(404).json({ error: "Member not found" });
        return;
    }

    service().discharge(member);
    res.status(204).end();
}
