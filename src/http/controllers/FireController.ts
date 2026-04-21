import { Request, Response } from "express";
import { MemberService } from "../../member/MemberService.js";
import { FireDomain } from "../../domains/fire/FireDomain.js";
import { FireCompany } from "../../domains/fire/FireCompany.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

function companyToDto(c: FireCompany) {
    return {
        id:          c.id,
        name:        c.name,
        description: c.description,
        staffIds:    c.getMembers(),
        staffCount:  c.getMembers().length,
        createdAt:   c.createdAt.toISOString(),
    };
}

// GET /fire/companies
export function listCompanies(_req: Request, res: Response): void {
    const companies = FireDomain.getInstance().getAllCompanies().map(companyToDto);
    res.json({ total: companies.length, companies });
}

// GET /fire/companies/:id
export function getCompany(req: Request, res: Response): void {
    const company = FireDomain.getInstance().getCompany(req.params.id as string);
    if (!company) { res.status(404).json({ error: "Fire company not found" }); return; }
    const memberService = MemberService.getInstance();
    const rolesByMember = new Map(company.getRoles().map(r => [r.memberId, r]));
    const staff = company.getMembers().map(id => {
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
    res.json({ ...companyToDto(company), staff });
}

// POST /fire/companies  — body: { name, description? }
export function createCompany(req: Request, res: Response): void {
    const { name, description } = req.body ?? {};
    if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "name is required" }); return;
    }
    const company = new FireCompany(name.trim());
    if (typeof description === "string" && description.trim()) {
        (company as unknown as Record<string, unknown>)["description"] = description.trim();
    }
    FireDomain.getInstance().addCompany(company);
    res.status(201).json(companyToDto(company));
}

// DELETE /fire/companies/:id
export function deleteCompany(req: Request, res: Response): void {
    const domain = FireDomain.getInstance();
    const company = domain.getCompany(req.params.id as string);
    if (!company) { res.status(404).json({ error: "Fire company not found" }); return; }
    domain.removeCompany(company.id);
    res.status(204).send();
}

// POST /fire/companies/:id/staff  — body: { memberId, title, creditsPerMonth }
export function addCompanyStaff(req: Request, res: Response): void {
    const domain = FireDomain.getInstance();
    const company = domain.getCompany(req.params.id as string);
    if (!company) { res.status(404).json({ error: "Fire company not found" }); return; }

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
    company.addRole(role);
    company.addMember(memberId);
    domain.saveCompany(company);
    res.status(204).send();
}

// DELETE /fire/companies/:id/staff/:memberId
export function removeCompanyStaff(req: Request, res: Response): void {
    const domain = FireDomain.getInstance();
    const company = domain.getCompany(req.params.id as string);
    if (!company) { res.status(404).json({ error: "Fire company not found" }); return; }

    const memberId = req.params.memberId as string;
    const roles = company.getRoles().filter(r => r.memberId !== memberId);
    company.clearRoles();
    for (const r of roles) company.addRole(r);
    company.removeMember(memberId);
    domain.saveCompany(company);
    res.status(204).send();
}
