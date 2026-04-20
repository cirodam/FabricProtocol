import { Request, Response } from "express";
import { MemberService } from "../../member/MemberService.js";
import { getMemberType, DEFAULT_NUTRITIONAL_PROFILES } from "../../domains/food/NutritionalProfile.js";
import { FoodDomain } from "../../domains/food/FoodDomain.js";
import { CommunityKitchen } from "../../domains/food/CommunityKitchen.js";
import { Mill } from "../../domains/food/Mill.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

function settingsDto() {
    const monthlyFoodAllowance = FoodDomain.getInstance().monthlyFoodAllowance;
    const memberCount = MemberService.getInstance().getAll().length;
    return {
        monthlyFoodAllowance,
        memberCount,
        monthlyOutflow: monthlyFoodAllowance * memberCount,
    };
}

// GET /food/requirements
export function getRequirements(_req: Request, res: Response): void {
    const members = MemberService.getInstance().getAll();

    const totals = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, waterL: 0 };
    for (const m of members) {
        const profile = DEFAULT_NUTRITIONAL_PROFILES[getMemberType(m.birthDate)];
        totals.calories  += profile.calories;
        totals.proteinG  += profile.proteinG;
        totals.carbsG    += profile.carbsG;
        totals.fatG      += profile.fatG;
        totals.fiberG    += profile.fiberG;
        totals.waterL    += profile.waterL;
    }

    res.json(totals);
}

// GET /food/settings
export function getSettings(_req: Request, res: Response): void {
    res.json(settingsDto());
}

// PUT /food/settings
export function updateSettings(req: Request, res: Response): void {
    const { monthlyFoodAllowance } = req.body ?? {};
    if (typeof monthlyFoodAllowance !== "number" || monthlyFoodAllowance < 0) {
        res.status(400).json({ error: "monthlyFoodAllowance must be a non-negative number" });
        return;
    }
    FoodDomain.getInstance().setMonthlyAllowance(monthlyFoodAllowance);
    res.json(settingsDto());
}

// ── Community Kitchen endpoints ──────────────────────────────────────────────

function kitchenToDto(k: CommunityKitchen) {
    return {
        id:          k.id,
        name:        k.name,
        description: k.description,
        staffIds:    k.getMembers(),
        staffCount:  k.getMembers().length,
        createdAt:   k.createdAt.toISOString(),
    };
}

// GET /food/kitchens
export function listKitchens(_req: Request, res: Response): void {
    const kitchens = FoodDomain.getInstance().getAllKitchens().map(kitchenToDto);
    res.json({ total: kitchens.length, kitchens });
}

// GET /food/kitchens/:id
export function getKitchen(req: Request, res: Response): void {
    const kitchen = FoodDomain.getInstance().getKitchen(req.params.id as string);
    if (!kitchen) { res.status(404).json({ error: "Kitchen not found" }); return; }
    const memberService = MemberService.getInstance();
    const rolesByMember = new Map(kitchen.getRoles().map(r => [r.memberId, r]));
    const staff = kitchen.getMembers().map(id => {
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
    res.json({ ...kitchenToDto(kitchen), staff });
}

// POST /food/kitchens  — body: { name, description? }
export function createKitchen(req: Request, res: Response): void {
    const { name, description } = req.body ?? {};
    if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "name is required" });
        return;
    }
    const kitchen = description
        ? new CommunityKitchen(name.trim(), description)
        : new CommunityKitchen(name.trim());
    FoodDomain.getInstance().addKitchen(kitchen);
    res.status(201).json(kitchenToDto(kitchen));
}

// DELETE /food/kitchens/:id
export function deleteKitchen(req: Request, res: Response): void {
    const domain = FoodDomain.getInstance();
    const kitchen = domain.getKitchen(req.params.id as string);
    if (!kitchen) { res.status(404).json({ error: "Kitchen not found" }); return; }
    domain.removeKitchen(kitchen.id);
    res.status(204).send();
}

// POST /food/kitchens/:id/staff  — body: { memberId, title, creditsPerMonth }
export function addKitchenStaff(req: Request, res: Response): void {
    const domain = FoodDomain.getInstance();
    const kitchen = domain.getKitchen(req.params.id as string);
    if (!kitchen) { res.status(404).json({ error: "Kitchen not found" }); return; }

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
    kitchen.addRole(role);
    kitchen.addMember(memberId);
    domain.saveKitchen(kitchen);
    res.status(204).send();
}

// DELETE /food/kitchens/:id/staff/:memberId
export function removeKitchenStaff(req: Request, res: Response): void {
    const domain = FoodDomain.getInstance();
    const kitchen = domain.getKitchen(req.params.id as string);
    if (!kitchen) { res.status(404).json({ error: "Kitchen not found" }); return; }

    const memberId = req.params.memberId as string;
    const roles = kitchen.getRoles().filter(r => r.memberId !== memberId);
    kitchen.clearRoles();
    for (const r of roles) kitchen.addRole(r);
    kitchen.removeMember(memberId);
    domain.saveKitchen(kitchen);
    res.status(204).send();
}

// ── Grain Mill endpoints ─────────────────────────────────────────────────────

function millToDto(m: Mill) {
    return {
        id:          m.id,
        name:        m.name,
        description: m.description,
        staffIds:    m.getMembers(),
        staffCount:  m.getMembers().length,
        createdAt:   m.createdAt.toISOString(),
    };
}

// GET /food/mills
export function listMills(_req: Request, res: Response): void {
    const mills = FoodDomain.getInstance().getAllMills().map(millToDto);
    res.json({ total: mills.length, mills });
}

// GET /food/mills/:id
export function getMill(req: Request, res: Response): void {
    const mill = FoodDomain.getInstance().getMill(req.params.id as string);
    if (!mill) { res.status(404).json({ error: "Mill not found" }); return; }
    const memberService = MemberService.getInstance();
    const rolesByMember = new Map(mill.getRoles().map(r => [r.memberId, r]));
    const staff = mill.getMembers().map(id => {
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
    res.json({ ...millToDto(mill), staff });
}

// POST /food/mills  — body: { name, description? }
export function createMill(req: Request, res: Response): void {
    const { name, description } = req.body ?? {};
    if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "name is required" }); return;
    }
    const mill = description
        ? new Mill(name.trim(), description)
        : new Mill(name.trim());
    FoodDomain.getInstance().addMill(mill);
    res.status(201).json(millToDto(mill));
}

// DELETE /food/mills/:id
export function deleteMill(req: Request, res: Response): void {
    const domain = FoodDomain.getInstance();
    const mill = domain.getMill(req.params.id as string);
    if (!mill) { res.status(404).json({ error: "Mill not found" }); return; }
    domain.removeMill(mill.id);
    res.status(204).send();
}

// POST /food/mills/:id/staff  — body: { memberId, title, creditsPerMonth }
export function addMillStaff(req: Request, res: Response): void {
    const domain = FoodDomain.getInstance();
    const mill = domain.getMill(req.params.id as string);
    if (!mill) { res.status(404).json({ error: "Mill not found" }); return; }

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
    mill.addRole(role);
    mill.addMember(memberId);
    domain.saveMill(mill);
    res.status(204).send();
}

// DELETE /food/mills/:id/staff/:memberId
export function removeMillStaff(req: Request, res: Response): void {
    const domain = FoodDomain.getInstance();
    const mill = domain.getMill(req.params.id as string);
    if (!mill) { res.status(404).json({ error: "Mill not found" }); return; }

    const memberId = req.params.memberId as string;
    const roles = mill.getRoles().filter(r => r.memberId !== memberId);
    mill.clearRoles();
    for (const r of roles) mill.addRole(r);
    mill.removeMember(memberId);
    domain.saveMill(mill);
    res.status(204).send();
}

