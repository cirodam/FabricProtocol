import { Request, Response } from "express";
import { MemberService } from "../../member/MemberService.js";
import { getMemberType, DEFAULT_NUTRITIONAL_PROFILES } from "../../domains/food/NutritionalProfile.js";
import { FoodDomain } from "../../domains/food/FoodDomain.js";

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

