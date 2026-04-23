import { Request, Response } from "express";
import { Commonwealth } from "../../commons/Commonwealth.js";
import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";
import { MemberService } from "../../member/MemberService.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

function getDomain(req: Request, res: Response): FunctionalDomain | null {
    const domain = Commonwealth.getInstance().getDomains()
        .find(d => d.id === req.params.domainId) as FunctionalDomain | undefined;
    if (!domain) { res.status(404).json({ error: "Domain not found" }); return null; }
    return domain;
}

function unitToDto(unit: FunctionalUnit) {
    return {
        id:          unit.id,
        name:        unit.name,
        type:        unit.getType(),
        description: unit.description,
        createdAt:   unit.createdAt.toISOString(),
        payroll:     unit.getPayroll(),
        roleCount:   unit.getRoles().length,
    };
}

function roleToDto(r: CommunityRole, memberName: string | null) {
    return {
        id:          r.id,
        title:       r.title,
        description: r.description,
        kinPerMonth: r.kinPerMonth,
        memberId:    r.memberId,
        memberName,
        active:      r.isActive(),
    };
}

// GET /api/domains/:domainId/units
export function listUnits(req: Request, res: Response): void {
    const domain = getDomain(req, res);
    if (!domain) return;
    res.json(domain.getUnits().map(unitToDto));
}

// GET /api/domains/:domainId/units/:unitId
export function getUnit(req: Request, res: Response): void {
    const domain = getDomain(req, res);
    if (!domain) return;
    const unit = domain.getUnits().find(u => u.id === req.params.unitId);
    if (!unit) { res.status(404).json({ error: "Unit not found" }); return; }

    const memberService = MemberService.getInstance();
    const roles = unit.getRoles().map(r => {
        const m = r.memberId ? memberService.get(r.memberId) : null;
        return roleToDto(r, m ? `${m.firstName} ${m.lastName}` : null);
    });

    res.json({ ...unitToDto(unit), roles });
}

// POST /api/domains/:domainId/units   body: { name, type, description? }
export function createUnit(req: Request, res: Response): void {
    const domain = getDomain(req, res);
    if (!domain) return;
    const { name, type, description } = req.body ?? {};
    if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "name is required" }); return;
    }
    if (typeof type !== "string" || !type.trim()) {
        res.status(400).json({ error: "type is required" }); return;
    }
    const unit = new FunctionalUnit(name.trim(), description?.trim() ?? "", type.trim());
    domain.addGenericUnit(unit);
    res.status(201).json(unitToDto(unit));
}

// DELETE /api/domains/:domainId/units/:unitId
export function deleteUnit(req: Request, res: Response): void {
    const domain = getDomain(req, res);
    if (!domain) return;
    const unit = domain.getUnits().find(u => u.id === req.params.unitId);
    if (!unit) { res.status(404).json({ error: "Unit not found" }); return; }
    domain.deleteUnit(String(req.params.unitId));
    res.status(204).send();
}

// POST /api/domains/:domainId/units/:unitId/roles   body: { title, description?, kinPerMonth? }
export function addRole(req: Request, res: Response): void {
    const domain = getDomain(req, res);
    if (!domain) return;
    const unit = domain.getUnits().find(u => u.id === req.params.unitId);
    if (!unit) { res.status(404).json({ error: "Unit not found" }); return; }

    const { title, description, kinPerMonth } = req.body ?? {};
    if (typeof title !== "string" || !title.trim()) {
        res.status(400).json({ error: "title is required" }); return;
    }
    const role = new CommunityRole(title.trim(), description?.trim() ?? "", Number(kinPerMonth) || 0);
    unit.addRole(role);
    domain.saveUnit(unit);
    res.status(201).json(roleToDto(role, null));
}

// DELETE /api/domains/:domainId/units/:unitId/roles/:roleId
export function removeRole(req: Request, res: Response): void {
    const domain = getDomain(req, res);
    if (!domain) return;
    const unit = domain.getUnits().find(u => u.id === req.params.unitId);
    if (!unit) { res.status(404).json({ error: "Unit not found" }); return; }
    const had = unit.getRoles().some(r => r.id === req.params.roleId);
    if (!had) { res.status(404).json({ error: "Role not found" }); return; }
    unit.removeRoleById(String(req.params.roleId));
    domain.saveUnit(unit);
    res.status(204).send();
}
