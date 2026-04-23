import { Request, Response } from "express";
import { HealthcareDomain } from "../../domains/healthcare/HealthcareDomain.js";
import { Clinic } from "../../domains/healthcare/Clinic.js";
import { DentalClinic } from "../../domains/healthcare/DentalClinic.js";
import { MemberService } from "../../member/MemberService.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

function clinicToDto(c: Clinic) {
    return {
        id:          c.id,
        name:        c.name,
        description: c.description,
        staffIds:    c.getMembers(),
        staffCount:  c.getMembers().length,
        createdAt:   c.createdAt.toISOString(),
    };
}

// GET /healthcare/clinics
export function listClinics(_req: Request, res: Response): void {
    const clinics = HealthcareDomain.getInstance().getAllClinics().map(clinicToDto);
    res.json({ total: clinics.length, clinics });
}

// GET /healthcare/clinics/:id
export function getClinic(req: Request, res: Response): void {
    const clinic = HealthcareDomain.getInstance().getClinic(req.params.id as string);
    if (!clinic) {
        res.status(404).json({ error: "Clinic not found" });
        return;
    }
    const memberService = MemberService.getInstance();
    // Build staff list from roles (members with assigned roles)
    const rolesByMember = new Map(clinic.getRoles().map(r => [r.memberId, r]));
    const staff = clinic.getMembers().map(id => {
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
    res.json({ ...clinicToDto(clinic), staff });
}

// POST /healthcare/clinics
// Body: { name, description? }
export function createClinic(req: Request, res: Response): void {
    const { name, description } = req.body ?? {};
    if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "name is required" });
        return;
    }
    const clinic = description
        ? new Clinic(name.trim(), description)
        : new Clinic(name.trim());
    HealthcareDomain.getInstance().addClinic(clinic);
    res.status(201).json(clinicToDto(clinic));
}

// DELETE /healthcare/clinics/:id
export function deleteClinic(req: Request, res: Response): void {
    const domain = HealthcareDomain.getInstance();
    const clinic = domain.getClinic(req.params.id as string);
    if (!clinic) {
        res.status(404).json({ error: "Clinic not found" });
        return;
    }
    domain.removeClinic(clinic.id);
    res.status(204).send();
}

// POST /healthcare/clinics/:id/staff  — body: { memberId, title, kinPerMonth }
export function addStaff(req: Request, res: Response): void {
    const domain = HealthcareDomain.getInstance();
    const clinic = domain.getClinic(req.params.id as string);
    if (!clinic) { res.status(404).json({ error: "Clinic not found" }); return; }

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
    clinic.addRole(role);
    clinic.addMember(memberId);
    domain.saveClinic(clinic);
    res.status(204).send();
}

// DELETE /healthcare/clinics/:id/staff/:memberId
export function removeStaff(req: Request, res: Response): void {
    const domain = HealthcareDomain.getInstance();
    const clinic = domain.getClinic(req.params.id as string);
    if (!clinic) { res.status(404).json({ error: "Clinic not found" }); return; }

    const memberId = req.params.memberId as string;
    // Remove the role assigned to this member
    const roles = clinic.getRoles().filter(r => r.memberId !== memberId);
    clinic.clearRoles();
    for (const r of roles) clinic.addRole(r);
    clinic.removeMember(memberId);
    domain.saveClinic(clinic);
    res.status(204).send();
}

// ── Dental Clinics ────────────────────────────────────────────────────────────

function dentalClinicToDto(c: DentalClinic) {
    return {
        id:          c.id,
        name:        c.name,
        description: c.description,
        staffIds:    c.getMembers(),
        staffCount:  c.getMembers().length,
        createdAt:   c.createdAt.toISOString(),
    };
}

// GET /healthcare/dental-clinics
export function listDentalClinics(_req: Request, res: Response): void {
    const clinics = HealthcareDomain.getInstance().getAllDentalClinics().map(dentalClinicToDto);
    res.json({ total: clinics.length, dentalClinics: clinics });
}

// GET /healthcare/dental-clinics/:id
export function getDentalClinic(req: Request, res: Response): void {
    const clinic = HealthcareDomain.getInstance().getDentalClinic(req.params.id as string);
    if (!clinic) { res.status(404).json({ error: "Dental clinic not found" }); return; }
    const memberService = MemberService.getInstance();
    const rolesByMember = new Map(clinic.getRoles().map(r => [r.memberId, r]));
    const staff = clinic.getMembers().map(id => {
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
    res.json({ ...dentalClinicToDto(clinic), staff });
}

// POST /healthcare/dental-clinics  — body: { name, description? }
export function createDentalClinic(req: Request, res: Response): void {
    const { name, description } = req.body ?? {};
    if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "name is required" });
        return;
    }
    const clinic = description
        ? new DentalClinic(name.trim(), description)
        : new DentalClinic(name.trim());
    HealthcareDomain.getInstance().addDentalClinic(clinic);
    res.status(201).json(dentalClinicToDto(clinic));
}

// DELETE /healthcare/dental-clinics/:id
export function deleteDentalClinic(req: Request, res: Response): void {
    const domain = HealthcareDomain.getInstance();
    const clinic = domain.getDentalClinic(req.params.id as string);
    if (!clinic) { res.status(404).json({ error: "Dental clinic not found" }); return; }
    domain.removeDentalClinic(clinic.id);
    res.status(204).send();
}

// POST /healthcare/dental-clinics/:id/staff  — body: { memberId, title, kinPerMonth }
export function addDentalStaff(req: Request, res: Response): void {
    const domain = HealthcareDomain.getInstance();
    const clinic = domain.getDentalClinic(req.params.id as string);
    if (!clinic) { res.status(404).json({ error: "Dental clinic not found" }); return; }

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
    clinic.addRole(role);
    clinic.addMember(memberId);
    domain.saveDentalClinic(clinic);
    res.status(204).send();
}

// DELETE /healthcare/dental-clinics/:id/staff/:memberId
export function removeDentalStaff(req: Request, res: Response): void {
    const domain = HealthcareDomain.getInstance();
    const clinic = domain.getDentalClinic(req.params.id as string);
    if (!clinic) { res.status(404).json({ error: "Dental clinic not found" }); return; }

    const memberId = req.params.memberId as string;
    const roles = clinic.getRoles().filter(r => r.memberId !== memberId);
    clinic.clearRoles();
    for (const r of roles) clinic.addRole(r);
    clinic.removeMember(memberId);
    domain.saveDentalClinic(clinic);
    res.status(204).send();
}

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
    res.json(HealthcareDomain.getInstance().getRoles().map(roleToDto));
}

export function createRole(req: Request, res: Response): void {
    const { title, description, kinPerMonth } = req.body ?? {};
    if (typeof title !== "string" || !title.trim()) { res.status(400).json({ error: "title is required" }); return; }
    const pay = typeof kinPerMonth === "number" && kinPerMonth >= 0 ? kinPerMonth : 0;
    const role = new CommunityRole(title.trim(), description ?? "", pay);
    HealthcareDomain.getInstance().addRole(role);
    res.status(201).json(roleToDto(role));
}

export function removeRole(req: Request, res: Response): void {
    const domain = HealthcareDomain.getInstance();
    const role = domain.getRoles().find(r => r.id === req.params.id);
    if (!role) { res.status(404).json({ error: "Role not found" }); return; }
    if (role.memberId) { res.status(409).json({ error: "Cannot delete a role with an assigned member" }); return; }
    domain.removeRoleById(role.id);
    res.status(204).send();
}

export function assignRole(req: Request, res: Response): void {
    const { memberId } = req.body ?? {};
    if (typeof memberId !== "string" || !memberId.trim()) { res.status(400).json({ error: "memberId is required" }); return; }
    const domain = HealthcareDomain.getInstance();
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
    const domain = HealthcareDomain.getInstance();
    const role = domain.getRoles().find(r => r.id === req.params.id);
    if (!role) { res.status(404).json({ error: "Role not found" }); return; }
    role.memberId = null;
    role.termStartDate = null;
    role.termEndDate = null;
    res.json(roleToDto(role));
}
