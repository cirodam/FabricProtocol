import { Request, Response } from "express";
import { ProvisioningDomain } from "../../domains/provisioning/ProvisioningDomain.js";
import { MemberService } from "../../member/MemberService.js";
import { CommunityRole } from "../../commons/CommunityRole.js";
import { Bank } from "../../bank/Bank.js";

// GET /provisioning
export function getOverview(_req: Request, res: Response): void {
    const domain = ProvisioningDomain.getInstance();
    const account = Bank.getInstance().getPrimaryAccount(domain.id);
    const officers = domain.getRoles().filter(r => r.memberId !== null);
    const memberService = MemberService.getInstance();

    res.json({
        id:          domain.id,
        name:        domain.name,
        description: domain.description,
        kin:         account?.kin ?? 0,
        payroll:     domain.getPayroll(),
        officers:    officers.map(r => {
            const m = memberService.get(r.memberId ?? "");
            return {
                memberId:     r.memberId,
                memberName:   m ? m.getDisplayName() : null,
                handle:       m?.handle ?? null,
                title:        r.title,
                kinPerMonth:  r.kinPerMonth,
                termStartDate: r.termStartDate?.toISOString() ?? null,
            };
        }),
    });
}

// POST /provisioning/officers  — body: { memberId, title?, kinPerMonth }
export function addOfficer(req: Request, res: Response): void {
    const { memberId, title, kinPerMonth } = req.body ?? {};
    if (typeof memberId !== "string" || !memberId.trim()) {
        res.status(400).json({ error: "memberId is required" }); return;
    }
    const salary = typeof kinPerMonth === "number" ? kinPerMonth : Number(kinPerMonth ?? 0);
    if (!Number.isFinite(salary) || salary < 0) {
        res.status(400).json({ error: "kinPerMonth must be a non-negative number" }); return;
    }
    if (!MemberService.getInstance().get(memberId)) {
        res.status(404).json({ error: "Member not found" }); return;
    }

    const role = new CommunityRole(
        typeof title === "string" && title.trim() ? title.trim() : "Supply Officer",
        "",
        salary,
    );
    role.memberId      = memberId;
    role.termStartDate = new Date();
    ProvisioningDomain.getInstance().addRole(role);
    res.status(201).json({
        memberId:     role.memberId,
        title:        role.title,
        kinPerMonth:  role.kinPerMonth,
        termStartDate: role.termStartDate?.toISOString() ?? null,
    });
}

// DELETE /provisioning/officers/:memberId
export function removeOfficer(req: Request, res: Response): void {
    ProvisioningDomain.getInstance().removeRole(req.params.memberId as string);
    res.status(204).send();
}
