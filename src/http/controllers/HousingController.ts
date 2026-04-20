import { Request, Response } from "express";
import { HousingDomain } from "../../domains/housing/HousingDomain.js";
import { HousingUnit } from "../../domains/housing/HousingUnit.js";
import { MemberService } from "../../member/MemberService.js";

function unitToDto(unit: ReturnType<HousingDomain["get"]>) {
    if (!unit) return null;
    return {
        id:              unit.id,
        ownerId:         unit.ownerId,
        name:            unit.name,
        latitude:        unit.latitude,
        longitude:       unit.longitude,
        hasRunningWater: unit.hasRunningWater,
        hasToilet:       unit.hasToilet,
        hasElectricity:  unit.hasElectricity,
        hasHeating:      unit.hasHeating,
        hasCooking:      unit.hasCooking,
        isHabitable:     unit.isHabitable,
        occupancy:       unit.occupancy(),
        memberIds:       unit.getMembers(),
        createdAt:       unit.createdAt.toISOString(),
    };
}

// GET /housing/units?page=1&pageSize=20
export function listUnits(req: Request, res: Response): void {
    const page     = Math.max(1, parseInt(req.query.page     as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 20));

    const all   = HousingDomain.getInstance().getAll();
    const total = all.length;
    const items = all
        .slice((page - 1) * pageSize, page * pageSize)
        .map(unitToDto);

    res.json({ total, page, pageSize, items });
}

// GET /housing/units/:id
export function getUnit(req: Request, res: Response): void {
    const unit = HousingDomain.getInstance().get(req.params.id as string);
    if (!unit) {
        res.status(404).json({ error: "Housing unit not found" });
        return;
    }

    const memberService = MemberService.getInstance();
    const residents = unit.getMembers().map(id => {
        const m = memberService.get(id);
        return m ? { id: m.id, name: m.getDisplayName(), handle: m.handle } : { id, name: "Unknown", handle: "" };
    });

    res.json({ ...unitToDto(unit), residents });
}

// POST /housing/units
// Body: { name, ownerId?, latitude?, longitude?, hasRunningWater?, hasToilet?, hasElectricity?, hasHeating?, hasCooking?, isHabitable? }
export function createUnit(req: Request, res: Response): void {
    const { name, ownerId, latitude, longitude, hasRunningWater, hasToilet, hasElectricity, hasHeating, hasCooking, isHabitable } = req.body ?? {};

    if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "name is required" });
        return;
    }

    const unit = new HousingUnit(
        ownerId ?? "community",
        name.trim(),
        typeof latitude  === "number" ? latitude  : 0,
        typeof longitude === "number" ? longitude : 0,
    );

    if (typeof hasRunningWater === "boolean") unit.hasRunningWater = hasRunningWater;
    if (typeof hasToilet       === "boolean") unit.hasToilet       = hasToilet;
    if (typeof hasElectricity  === "boolean") unit.hasElectricity  = hasElectricity;
    if (typeof hasHeating      === "boolean") unit.hasHeating      = hasHeating;
    if (typeof hasCooking      === "boolean") unit.hasCooking      = hasCooking;
    if (typeof isHabitable     === "boolean") unit.isHabitable     = isHabitable;

    HousingDomain.getInstance().add(unit);
    res.status(201).json(unitToDto(unit));
}

// DELETE /housing/units/:id
export function deleteUnit(req: Request, res: Response): void {
    const domain = HousingDomain.getInstance();
    const unit = domain.get(req.params.id as string);
    if (!unit) {
        res.status(404).json({ error: "Housing unit not found" });
        return;
    }
    domain.remove(unit.id);
    res.status(204).send();
}
