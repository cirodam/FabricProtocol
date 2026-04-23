import { Request, Response } from "express";
import { Member, LanguageProficiency } from "../../member/Member.js";
import { MemberService } from "../../member/MemberService.js";

const service = () => MemberService.getInstance();

/** Elapsed years since birthDate, rounded to 2 decimal places. */
function personYears(birthDate: Date): number {
    const ms = Date.now() - birthDate.getTime();
    return Math.round((ms / (365.25 * 24 * 60 * 60 * 1000)) * 100) / 100;
}

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
    const { firstName, lastName, birthDate, disabled, handle, guardianId, phone, languages } = req.body ?? {};

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
    if (disabled !== undefined && typeof disabled !== "boolean") {
        res.status(400).json({ error: "disabled must be a boolean" });
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
        handle || undefined,
        disabled ?? false,
    );
    if (guardianId) member.guardianId = guardianId;
    if (phone) member.phone = phone;
    if (Array.isArray(languages)) member.languages = (languages as LanguageProficiency[]);

    service().add(member);
    res.status(201).json(toDto(member));
}

// PATCH /members/:id
// Body: any subset of { firstName, lastName, phone, disabled, languages }
export function updateMember(req: Request, res: Response): void {
    const member = service().get(req.params.id as string);
    if (!member) {
        res.status(404).json({ error: "Member not found" });
        return;
    }

    const { firstName, lastName, phone, disabled, retired, languages } = req.body ?? {};

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
    if (disabled !== undefined) {
        if (typeof disabled !== "boolean") {
            res.status(400).json({ error: "disabled must be a boolean" });
            return;
        }
        member.disabled = disabled;
    }
    if (retired !== undefined) {
        if (typeof retired !== "boolean") {
            res.status(400).json({ error: "retired must be a boolean" });
            return;
        }
        member.retired = retired;
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
        personYears:        personYears(m.birthDate),
        disabled:           m.disabled,
        retired:            m.retired,
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

// GET /members/demographics
export function getDemographics(_req: Request, res: Response): void {
    const members = service().getAll();
    const now = Date.now();

    function ageYears(m: Member): number {
        return Math.floor((now - new Date(m.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }

    const WORKING_AGE_MIN = 15;
    const WORKING_AGE_MAX = 64;

    const ageBrackets = [
        { label: "0–14",  min: 0,  max: 14,  count: 0 },
        { label: "15–24", min: 15, max: 24,  count: 0 },
        { label: "25–44", min: 25, max: 44,  count: 0 },
        { label: "45–64", min: 45, max: 64,  count: 0 },
        { label: "65+",   min: 65, max: Infinity, count: 0 },
    ];

    let workingAge = 0;
    let disabled = 0;
    let dependents = 0;

    for (const m of members) {
        const age = ageYears(m);
        for (const b of ageBrackets) {
            if (age >= b.min && age <= b.max) { b.count++; break; }
        }
        if (m.disabled) disabled++;
        const isWorkingAge = age >= WORKING_AGE_MIN && age <= WORKING_AGE_MAX;
        if (isWorkingAge) workingAge++;
        if (age < WORKING_AGE_MIN || age > WORKING_AGE_MAX || m.disabled) dependents++;
    }

    const laborPool = workingAge - disabled;
    const dependencyRatio = laborPool > 0
        ? Math.round((dependents / laborPool) * 100) / 100
        : null;

    res.json({
        total: members.length,
        workingAgeMin: WORKING_AGE_MIN,
        workingAgeMax: WORKING_AGE_MAX,
        workingAge,
        disabled,
        laborPool,
        dependents,
        dependencyRatio,
        ageBrackets,
    });
}
