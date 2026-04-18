import { Request, Response } from "express";
import { Member } from "../../member/Member.js";
import { MemberService } from "../../member/MemberService.js";
import { MemberType } from "../../domains/food/NutritionalProfile.js";

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
// Body: { firstName, lastName, birthDate, memberType?, phone? }
export function createMember(req: Request, res: Response): void {
    const { firstName, lastName, birthDate, memberType, phone } = req.body ?? {};

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
    if (memberType !== undefined && !Object.values(MemberType).includes(memberType)) {
        res.status(400).json({ error: `memberType must be one of: ${Object.values(MemberType).join(", ")}` });
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
        memberType ?? MemberType.ADULT,
    );
    if (phone) member.phone = phone;

    service().add(member);
    res.status(201).json(toDto(member));
}

// PATCH /members/:id
// Body: any subset of { firstName, lastName, phone, physicalCapacity, cognitiveCapacity }
export function updateMember(req: Request, res: Response): void {
    const member = service().get(req.params.id as string);
    if (!member) {
        res.status(404).json({ error: "Member not found" });
        return;
    }

    const { firstName, lastName, phone, physicalCapacity, cognitiveCapacity } = req.body ?? {};

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
        memberType:         m.memberType,
        trustScore:         m.trustScore,
        physicalCapacity:   m.physicalCapacity,
        cognitiveCapacity:  m.cognitiveCapacity,
        guardianId:         m.guardianId,
        dependencyCareId:   m.dependencyCareId,
        phone:              m.phone,
    };
}
