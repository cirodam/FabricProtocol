import { Request, Response } from "express";
import { EducationDomain } from "../../domains/education/EducationDomain.js";
import { School } from "../../domains/education/School.js";
import { Library } from "../../domains/education/Library.js";
import { MemberService } from "../../member/MemberService.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

function schoolToDto(s: School) {
    return {
        id:          s.id,
        name:        s.name,
        description: s.description,
        staffIds:    s.getMembers(),
        staffCount:  s.getMembers().length,
        createdAt:   s.createdAt.toISOString(),
    };
}

// GET /education/schools
export function listSchools(_req: Request, res: Response): void {
    const schools = EducationDomain.getInstance().getAllSchools().map(schoolToDto);
    res.json({ total: schools.length, schools });
}

// GET /education/schools/:id
export function getSchool(req: Request, res: Response): void {
    const school = EducationDomain.getInstance().getSchool(req.params.id as string);
    if (!school) { res.status(404).json({ error: "School not found" }); return; }
    const memberService = MemberService.getInstance();
    const rolesByMember = new Map(school.getRoles().map(r => [r.memberId, r]));
    const staff = school.getMembers().map(id => {
        const m    = memberService.get(id);
        const role = rolesByMember.get(id);
        return {
            id:              m?.id ?? id,
            firstName:       m?.firstName ?? "Unknown",
            lastName:        m?.lastName ?? "",
            handle:          m?.handle ?? "",
            roleTitle:       role?.title ?? "",
            kinPerMonth: role?.kinPerMonth ?? 0,
        };
    });
    res.json({ ...schoolToDto(school), staff });
}

// POST /education/schools  — body: { name, description? }
export function createSchool(req: Request, res: Response): void {
    const { name, description } = req.body ?? {};
    if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "name is required" });
        return;
    }
    const school = description
        ? new School(name.trim(), description)
        : new School(name.trim());
    EducationDomain.getInstance().addSchool(school);
    res.status(201).json(schoolToDto(school));
}

// DELETE /education/schools/:id
export function deleteSchool(req: Request, res: Response): void {
    const domain = EducationDomain.getInstance();
    const school = domain.getSchool(req.params.id as string);
    if (!school) { res.status(404).json({ error: "School not found" }); return; }
    domain.removeSchool(school.id);
    res.status(204).send();
}

// POST /education/schools/:id/staff  — body: { memberId, title, kinPerMonth }
export function addSchoolStaff(req: Request, res: Response): void {
    const domain = EducationDomain.getInstance();
    const school = domain.getSchool(req.params.id as string);
    if (!school) { res.status(404).json({ error: "School not found" }); return; }

    const { memberId, title, kinPerMonth } = req.body ?? {};
    if (typeof memberId !== "string" || !memberId.trim()) {
        res.status(400).json({ error: "memberId is required" });
        return;
    }
    if (typeof title !== "string" || !title.trim()) {
        res.status(400).json({ error: "title is required" });
        return;
    }
    const salary = typeof kinPerMonth === "number" ? kinPerMonth : Number(kinPerMonth ?? 0);
    if (!Number.isFinite(salary) || salary < 0) {
        res.status(400).json({ error: "kinPerMonth must be a non-negative number" });
        return;
    }
    if (!MemberService.getInstance().get(memberId)) {
        res.status(404).json({ error: "Member not found" });
        return;
    }
    const role = new CommunityRole(title.trim(), "", salary);
    role.memberId      = memberId;
    role.termStartDate = new Date();
    school.addRole(role);
    school.addMember(memberId);
    domain.saveSchool(school);
    res.status(204).send();
}

// DELETE /education/schools/:id/staff/:memberId
export function removeSchoolStaff(req: Request, res: Response): void {
    const domain = EducationDomain.getInstance();
    const school = domain.getSchool(req.params.id as string);
    if (!school) { res.status(404).json({ error: "School not found" }); return; }

    const memberId = req.params.memberId as string;
    const roles = school.getRoles().filter(r => r.memberId !== memberId);
    school.clearRoles();
    for (const r of roles) school.addRole(r);
    school.removeMember(memberId);
    domain.saveSchool(school);
    res.status(204).send();
}

// ── Libraries ─────────────────────────────────────────────────────────────────

function libraryToDto(l: Library) {
    return {
        id:          l.id,
        name:        l.name,
        description: l.description,
        staffIds:    l.getMembers(),
        staffCount:  l.getMembers().length,
        createdAt:   l.createdAt.toISOString(),
    };
}

// GET /education/libraries
export function listLibraries(_req: Request, res: Response): void {
    const libraries = EducationDomain.getInstance().getAllLibraries().map(libraryToDto);
    res.json({ total: libraries.length, libraries });
}

// GET /education/libraries/:id
export function getLibrary(req: Request, res: Response): void {
    const library = EducationDomain.getInstance().getLibrary(req.params.id as string);
    if (!library) { res.status(404).json({ error: "Library not found" }); return; }
    const memberService = MemberService.getInstance();
    const rolesByMember = new Map(library.getRoles().map(r => [r.memberId, r]));
    const staff = library.getMembers().map(id => {
        const m    = memberService.get(id);
        const role = rolesByMember.get(id);
        return {
            id:              m?.id ?? id,
            firstName:       m?.firstName ?? "Unknown",
            lastName:        m?.lastName ?? "",
            handle:          m?.handle ?? "",
            roleTitle:       role?.title ?? "",
            kinPerMonth: role?.kinPerMonth ?? 0,
        };
    });
    res.json({ ...libraryToDto(library), staff });
}

// POST /education/libraries  — body: { name, description? }
export function createLibrary(req: Request, res: Response): void {
    const { name, description } = req.body ?? {};
    if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "name is required" });
        return;
    }
    const library = description
        ? new Library(name.trim(), description)
        : new Library(name.trim());
    EducationDomain.getInstance().addLibrary(library);
    res.status(201).json(libraryToDto(library));
}

// DELETE /education/libraries/:id
export function deleteLibrary(req: Request, res: Response): void {
    const domain  = EducationDomain.getInstance();
    const library = domain.getLibrary(req.params.id as string);
    if (!library) { res.status(404).json({ error: "Library not found" }); return; }
    domain.removeLibrary(library.id);
    res.status(204).send();
}

// POST /education/libraries/:id/staff  — body: { memberId, title, kinPerMonth }
export function addLibraryStaff(req: Request, res: Response): void {
    const domain  = EducationDomain.getInstance();
    const library = domain.getLibrary(req.params.id as string);
    if (!library) { res.status(404).json({ error: "Library not found" }); return; }

    const { memberId, title, kinPerMonth } = req.body ?? {};
    if (typeof memberId !== "string" || !memberId.trim()) {
        res.status(400).json({ error: "memberId is required" });
        return;
    }
    if (typeof title !== "string" || !title.trim()) {
        res.status(400).json({ error: "title is required" });
        return;
    }
    const salary = typeof kinPerMonth === "number" ? kinPerMonth : Number(kinPerMonth ?? 0);
    if (!Number.isFinite(salary) || salary < 0) {
        res.status(400).json({ error: "kinPerMonth must be a non-negative number" });
        return;
    }
    if (!MemberService.getInstance().get(memberId)) {
        res.status(404).json({ error: "Member not found" });
        return;
    }
    const role = new CommunityRole(title.trim(), "", salary);
    role.memberId      = memberId;
    role.termStartDate = new Date();
    library.addRole(role);
    library.addMember(memberId);
    domain.saveLibrary(library);
    res.status(204).send();
}

// DELETE /education/libraries/:id/staff/:memberId
export function removeLibraryStaff(req: Request, res: Response): void {
    const domain  = EducationDomain.getInstance();
    const library = domain.getLibrary(req.params.id as string);
    if (!library) { res.status(404).json({ error: "Library not found" }); return; }

    const memberId = req.params.memberId as string;
    const roles = library.getRoles().filter(r => r.memberId !== memberId);
    library.clearRoles();
    for (const r of roles) library.addRole(r);
    library.removeMember(memberId);
    domain.saveLibrary(library);
    res.status(204).send();
}
