import { Request, Response } from "express";
import { MemberService } from "../../member/MemberService.js";
import { ChildcareDomain } from "../../domains/child_care/ChildcareDomain.js";
import { HomeChildcare } from "../../domains/child_care/HomeChildcare.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

function hcToDto(u: HomeChildcare) {
    return {
        id:          u.id,
        name:        u.name,
        description: u.description,
        staffIds:    u.getMembers(),
        staffCount:  u.getMembers().length,
        createdAt:   u.createdAt.toISOString(),
    };
}

// GET /child-care/home-childcare
export function getHomeChildcareUnit(_req: Request, res: Response): void {
    const unit = ChildcareDomain.getInstance().getHomeChildcare();
    if (!unit) { res.status(503).json({ error: "Home childcare not initialised" }); return; }
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
            kinPerMonth: role?.kinPerMonth ?? 0,
        };
    });
    res.json({ ...hcToDto(unit), staff });
}

// POST /child-care/home-childcare/staff  — body: { memberId, title, kinPerMonth }
export function addHomeChildcareStaff(req: Request, res: Response): void {
    const domain = ChildcareDomain.getInstance();
    const unit = domain.getHomeChildcare();
    if (!unit) { res.status(503).json({ error: "Home childcare not initialised" }); return; }

    const { memberId, title, kinPerMonth } = req.body ?? {};
    if (typeof memberId !== "string" || !memberId.trim()) {
        res.status(400).json({ error: "memberId is required" }); return;
    }
    if (typeof title !== "string" || !title.trim()) {
        res.status(400).json({ error: "title is required" }); return;
    }
    const salary = typeof kinPerMonth === "number" ? kinPerMonth : Number(kinPerMonth ?? 0);
    if (!Number.isFinite(salary) || salary < 0) {
        res.status(400).json({ error: "kinPerMonth must be a non-negative number" }); return;
    }
    if (!MemberService.getInstance().get(memberId)) {
        res.status(404).json({ error: "Member not found" }); return;
    }
    const role = new CommunityRole(title.trim(), "", salary);
    role.memberId      = memberId;
    role.termStartDate = new Date();
    unit.addRole(role);
    unit.addMember(memberId);
    domain.saveHomeChildcare();
    res.status(204).send();
}

// DELETE /child-care/home-childcare/staff/:memberId
export function removeHomeChildcareStaff(req: Request, res: Response): void {
    const domain = ChildcareDomain.getInstance();
    const unit = domain.getHomeChildcare();
    if (!unit) { res.status(503).json({ error: "Home childcare not initialised" }); return; }

    const memberId = req.params.memberId as string;
    const roles = unit.getRoles().filter(r => r.memberId !== memberId);
    unit.clearRoles();
    for (const r of roles) unit.addRole(r);
    unit.removeMember(memberId);
    domain.saveHomeChildcare();
    res.status(204).send();
}
