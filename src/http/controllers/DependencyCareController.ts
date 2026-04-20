import { Request, Response } from "express";
import { MemberService } from "../../member/MemberService.js";
import { DependencyCareDomain } from "../../domains/dependency_care/DependencyCareDomain.js";
import { SharedHousehold } from "../../domains/dependency_care/SharedHousehold.js";
import { MedicalCareUnit } from "../../domains/dependency_care/MedicalCareUnit.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

function householdToDto(h: SharedHousehold) {
    return {
        id:          h.id,
        name:        h.name,
        description: h.description,
        staffIds:    h.getMembers(),
        staffCount:  h.getMembers().length,
        createdAt:   h.createdAt.toISOString(),
    };
}

// GET /dependency-care/households
export function listHouseholds(_req: Request, res: Response): void {
    const households = DependencyCareDomain.getInstance().getAllHouseholds().map(householdToDto);
    res.json({ total: households.length, households });
}

// GET /dependency-care/households/:id
export function getHousehold(req: Request, res: Response): void {
    const household = DependencyCareDomain.getInstance().getHousehold(req.params.id as string);
    if (!household) { res.status(404).json({ error: "Household not found" }); return; }
    const memberService = MemberService.getInstance();
    const rolesByMember = new Map(household.getRoles().map(r => [r.memberId, r]));
    const staff = household.getMembers().map(id => {
        const m = memberService.get(id);
        const role = rolesByMember.get(id);
        return {
            id:              m?.id ?? id,
            firstName:       m?.firstName ?? "Unknown",
            lastName:        m?.lastName ?? "",
            handle:          m?.handle ?? "",
            roleTitle:       role?.title ?? "",
            creditsPerMonth: role?.creditsPerMonth ?? 0,
        };
    });
    res.json({ ...householdToDto(household), staff });
}

// POST /dependency-care/households  — body: { name, description? }
export function createHousehold(req: Request, res: Response): void {
    const { name, description } = req.body ?? {};
    if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "name is required" }); return;
    }
    const household = new SharedHousehold(name.trim());
    if (typeof description === "string" && description.trim()) {
        (household as unknown as Record<string, unknown>)["description"] = description.trim();
    }
    DependencyCareDomain.getInstance().addHousehold(household);
    res.status(201).json(householdToDto(household));
}

// DELETE /dependency-care/households/:id
export function deleteHousehold(req: Request, res: Response): void {
    const domain = DependencyCareDomain.getInstance();
    const household = domain.getHousehold(req.params.id as string);
    if (!household) { res.status(404).json({ error: "Household not found" }); return; }
    domain.removeHousehold(household.id);
    res.status(204).send();
}

// POST /dependency-care/households/:id/staff  — body: { memberId, title, creditsPerMonth }
export function addHouseholdStaff(req: Request, res: Response): void {
    const domain = DependencyCareDomain.getInstance();
    const household = domain.getHousehold(req.params.id as string);
    if (!household) { res.status(404).json({ error: "Household not found" }); return; }

    const { memberId, title, creditsPerMonth } = req.body ?? {};
    if (typeof memberId !== "string" || !memberId.trim()) {
        res.status(400).json({ error: "memberId is required" }); return;
    }
    if (typeof title !== "string" || !title.trim()) {
        res.status(400).json({ error: "title is required" }); return;
    }
    const salary = typeof creditsPerMonth === "number" ? creditsPerMonth : Number(creditsPerMonth ?? 0);
    if (!Number.isFinite(salary) || salary < 0) {
        res.status(400).json({ error: "creditsPerMonth must be a non-negative number" }); return;
    }
    if (!MemberService.getInstance().get(memberId)) {
        res.status(404).json({ error: "Member not found" }); return;
    }
    const role = new CommunityRole(title.trim(), "", salary);
    role.memberId      = memberId;
    role.termStartDate = new Date();
    household.addRole(role);
    household.addMember(memberId);
    domain.saveHousehold(household);
    res.status(204).send();
}

// DELETE /dependency-care/households/:id/staff/:memberId
export function removeHouseholdStaff(req: Request, res: Response): void {
    const domain = DependencyCareDomain.getInstance();
    const household = domain.getHousehold(req.params.id as string);
    if (!household) { res.status(404).json({ error: "Household not found" }); return; }

    const memberId = req.params.memberId as string;
    const roles = household.getRoles().filter(r => r.memberId !== memberId);
    household.clearRoles();
    for (const r of roles) household.addRole(r);
    household.removeMember(memberId);
    domain.saveHousehold(household);
    res.status(204).send();
}

// ── Medical Care Unit endpoints ───────────────────────────────────────────────

function mcuToDto(u: MedicalCareUnit) {
    return {
        id:          u.id,
        name:        u.name,
        description: u.description,
        staffIds:    u.getMembers(),
        staffCount:  u.getMembers().length,
        createdAt:   u.createdAt.toISOString(),
    };
}

// GET /dependency-care/medical-care-units
export function listMedicalCareUnits(_req: Request, res: Response): void {
    const units = DependencyCareDomain.getInstance().getAllMedicalCareUnits().map(mcuToDto);
    res.json({ total: units.length, units });
}

// GET /dependency-care/medical-care-units/:id
export function getMedicalCareUnit(req: Request, res: Response): void {
    const unit = DependencyCareDomain.getInstance().getMedicalCareUnit(req.params.id as string);
    if (!unit) { res.status(404).json({ error: "Medical care unit not found" }); return; }
    const memberService = MemberService.getInstance();
    const rolesByMember = new Map(unit.getRoles().map(r => [r.memberId, r]));
    const staff = unit.getMembers().map(id => {
        const m = memberService.get(id);
        const role = rolesByMember.get(id);
        return {
            id:              m?.id ?? id,
            firstName:       m?.firstName ?? "Unknown",
            lastName:        m?.lastName ?? "",
            handle:          m?.handle ?? "",
            roleTitle:       role?.title ?? "",
            creditsPerMonth: role?.creditsPerMonth ?? 0,
        };
    });
    res.json({ ...mcuToDto(unit), staff });
}

// POST /dependency-care/medical-care-units  — body: { name?, description? }
export function createMedicalCareUnit(req: Request, res: Response): void {
    const { name, description } = req.body ?? {};
    const unit = new MedicalCareUnit(typeof name === "string" && name.trim() ? name.trim() : undefined);
    if (typeof description === "string" && description.trim()) {
        (unit as unknown as Record<string, unknown>)["description"] = description.trim();
    }
    DependencyCareDomain.getInstance().addMedicalCareUnit(unit);
    res.status(201).json(mcuToDto(unit));
}

// DELETE /dependency-care/medical-care-units/:id
export function deleteMedicalCareUnit(req: Request, res: Response): void {
    const domain = DependencyCareDomain.getInstance();
    const unit = domain.getMedicalCareUnit(req.params.id as string);
    if (!unit) { res.status(404).json({ error: "Medical care unit not found" }); return; }
    domain.removeMedicalCareUnit(unit.id);
    res.status(204).send();
}

// POST /dependency-care/medical-care-units/:id/staff  — body: { memberId, title, creditsPerMonth }
export function addMedicalCareUnitStaff(req: Request, res: Response): void {
    const domain = DependencyCareDomain.getInstance();
    const unit = domain.getMedicalCareUnit(req.params.id as string);
    if (!unit) { res.status(404).json({ error: "Medical care unit not found" }); return; }

    const { memberId, title, creditsPerMonth } = req.body ?? {};
    if (typeof memberId !== "string" || !memberId.trim()) {
        res.status(400).json({ error: "memberId is required" }); return;
    }
    if (typeof title !== "string" || !title.trim()) {
        res.status(400).json({ error: "title is required" }); return;
    }
    const salary = typeof creditsPerMonth === "number" ? creditsPerMonth : Number(creditsPerMonth ?? 0);
    if (!Number.isFinite(salary) || salary < 0) {
        res.status(400).json({ error: "creditsPerMonth must be a non-negative number" }); return;
    }
    if (!MemberService.getInstance().get(memberId)) {
        res.status(404).json({ error: "Member not found" }); return;
    }
    const role = new CommunityRole(title.trim(), "", salary);
    role.memberId      = memberId;
    role.termStartDate = new Date();
    unit.addRole(role);
    unit.addMember(memberId);
    domain.saveMedicalCareUnit(unit);
    res.status(204).send();
}

// DELETE /dependency-care/medical-care-units/:id/staff/:memberId
export function removeMedicalCareUnitStaff(req: Request, res: Response): void {
    const domain = DependencyCareDomain.getInstance();
    const unit = domain.getMedicalCareUnit(req.params.id as string);
    if (!unit) { res.status(404).json({ error: "Medical care unit not found" }); return; }

    const memberId = req.params.memberId as string;
    const roles = unit.getRoles().filter(r => r.memberId !== memberId);
    unit.clearRoles();
    for (const r of roles) unit.addRole(r);
    unit.removeMember(memberId);
    domain.saveMedicalCareUnit(unit);
    res.status(204).send();
}
