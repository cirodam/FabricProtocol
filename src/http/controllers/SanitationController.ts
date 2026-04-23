import { Request, Response } from "express";
import { SanitationDomain } from "../../domains/sanitation/SanitationDomain.js";
import { MemberService } from "../../member/MemberService.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

function roleToDto(r: CommunityRole) {
    const member = r.memberId ? MemberService.getInstance().get(r.memberId) : null;
    return {
        id:          r.id,
        title:       r.title,
        description: r.description,
        kinPerMonth: r.kinPerMonth,
        memberId:    r.memberId,
        memberName:  member ? `${member.firstName} ${member.lastName}` : null,
        active:      r.isActive(),
    };
}

export function listRoles(_req: Request, res: Response): void {
    res.json(SanitationDomain.getInstance().getRoles().map(roleToDto));
}

export function createRole(req: Request, res: Response): void {
    const { title, description, kinPerMonth } = req.body ?? {};
    if (typeof title !== "string" || !title.trim()) { res.status(400).json({ error: "title is required" }); return; }
    const pay = typeof kinPerMonth === "number" && kinPerMonth >= 0 ? kinPerMonth : 0;
    const role = new CommunityRole(title.trim(), description ?? "", pay);
    SanitationDomain.getInstance().addRole(role);
    res.status(201).json(roleToDto(role));
}

export function removeRole(req: Request, res: Response): void {
    const domain = SanitationDomain.getInstance();
    const role = domain.getRoles().find(r => r.id === req.params.id);
    if (!role) { res.status(404).json({ error: "Role not found" }); return; }
    if (role.memberId) { res.status(409).json({ error: "Cannot delete a role with an assigned member" }); return; }
    domain.removeRoleById(role.id);
    res.status(204).send();
}

export function assignRole(req: Request, res: Response): void {
    const { memberId } = req.body ?? {};
    if (typeof memberId !== "string" || !memberId.trim()) { res.status(400).json({ error: "memberId is required" }); return; }
    const domain = SanitationDomain.getInstance();
    const role = domain.getRoles().find(r => r.id === req.params.id);
    if (!role) { res.status(404).json({ error: "Role not found" }); return; }
    const member = MemberService.getInstance().get(memberId);
    if (!member) { res.status(404).json({ error: "Member not found" }); return; }
    role.memberId = memberId;
    role.termStartDate = new Date();
    role.termEndDate = null;
    role.funded = role.kinPerMonth > 0;
    res.json(roleToDto(role));
}

export function unassignRole(req: Request, res: Response): void {
    const domain = SanitationDomain.getInstance();
    const role = domain.getRoles().find(r => r.id === req.params.id);
    if (!role) { res.status(404).json({ error: "Role not found" }); return; }
    role.memberId = null;
    role.termStartDate = null;
    role.termEndDate = null;
    res.json(roleToDto(role));
}
