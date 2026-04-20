import { Request, Response } from "express";
import { CourierDomain } from "../../domains/courier/CourierDomain.js";
import { DeliveryRequest, DeliveryPriority } from "../../domains/courier/DeliveryRequest.js";
import { MemberService } from "../../member/MemberService.js";
import { LocationRegistry } from "../../location/LocationRegistry.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

function requestToDto(r: DeliveryRequest) {
    const origin      = LocationRegistry.getInstance().get(r.originLocationId);
    const destination = LocationRegistry.getInstance().get(r.destinationLocationId);
    return {
        id:                    r.id,
        requesterId:           r.requesterId,
        description:           r.description,
        originLocationId:      r.originLocationId,
        originLabel:           origin?.label ?? null,
        destinationLocationId: r.destinationLocationId,
        destinationLabel:      destination?.label ?? null,
        priority:              r.priority,
        status:                r.status,
        createdAt:             r.createdAt.toISOString(),
        completedAt:           r.completedAt?.toISOString() ?? null,
    };
}

const VALID_PRIORITIES = new Set<DeliveryPriority>(["regular", "urgent"]);

// ── Delivery requests ──────────────────────────────────────────────────────────

// GET /courier/requests?status=pending|in-progress|completed|cancelled&priority=regular|urgent
export function listRequests(req: Request, res: Response): void {
    let requests = CourierDomain.getInstance().getAllRequests();
    const { status, priority } = req.query;
    if (typeof status   === "string") requests = requests.filter(r => r.status   === status);
    if (typeof priority === "string") requests = requests.filter(r => r.priority === priority);
    // Urgent first, then by createdAt ascending
    requests.sort((a, b) => {
        if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
        return a.createdAt.getTime() - b.createdAt.getTime();
    });
    res.json({ total: requests.length, requests: requests.map(requestToDto) });
}

// GET /courier/requests/:id
export function getRequest(req: Request, res: Response): void {
    const r = CourierDomain.getInstance().getRequest(req.params.id as string);
    if (!r) { res.status(404).json({ error: "Delivery request not found" }); return; }
    res.json(requestToDto(r));
}

// POST /courier/requests  — body: { requesterId, description, originLocationId, destinationLocationId, priority? }
export function createRequest(req: Request, res: Response): void {
    const { requesterId, description, originLocationId, destinationLocationId, priority } = req.body ?? {};

    if (typeof requesterId           !== "string" || !requesterId.trim())           { res.status(400).json({ error: "requesterId is required" }); return; }
    if (typeof description           !== "string" || !description.trim())           { res.status(400).json({ error: "description is required" }); return; }
    if (typeof originLocationId      !== "string" || !originLocationId.trim())      { res.status(400).json({ error: "originLocationId is required" }); return; }
    if (typeof destinationLocationId !== "string" || !destinationLocationId.trim()) { res.status(400).json({ error: "destinationLocationId is required" }); return; }

    if (!MemberService.getInstance().get(requesterId)) { res.status(404).json({ error: "Requester member not found" }); return; }
    if (!LocationRegistry.getInstance().get(originLocationId))      { res.status(404).json({ error: "Origin location not found" }); return; }
    if (!LocationRegistry.getInstance().get(destinationLocationId)) { res.status(404).json({ error: "Destination location not found" }); return; }

    const prio: DeliveryPriority = VALID_PRIORITIES.has(priority as DeliveryPriority) ? priority as DeliveryPriority : "regular";
    const request = new DeliveryRequest(requesterId, description.trim(), originLocationId, destinationLocationId, prio);
    CourierDomain.getInstance().addRequest(request);
    res.status(201).json(requestToDto(request));
}

// POST /courier/requests/:id/cancel
export function cancelRequest(req: Request, res: Response): void {
    try {
        CourierDomain.getInstance().cancelRequest(req.params.id as string);
        res.status(204).send();
    } catch {
        res.status(404).json({ error: "Delivery request not found" });
    }
}

// POST /courier/requests/:id/complete
export function completeRequest(req: Request, res: Response): void {
    try {
        CourierDomain.getInstance().completeRequest(req.params.id as string);
        res.status(204).send();
    } catch {
        res.status(404).json({ error: "Delivery request not found" });
    }
}

// DELETE /courier/requests/:id
export function deleteRequest(req: Request, res: Response): void {
    const r = CourierDomain.getInstance().getRequest(req.params.id as string);
    if (!r) { res.status(404).json({ error: "Delivery request not found" }); return; }
    CourierDomain.getInstance().removeRequest(r.id);
    res.status(204).send();
}

// ── Couriers (staff) ───────────────────────────────────────────────────────────

function courierToDto(role: CommunityRole) {
    const member = MemberService.getInstance().get(role.memberId ?? "");
    return {
        memberId:        role.memberId,
        memberName:      member ? member.getDisplayName() : null,
        handle:          member?.handle ?? null,
        title:           role.title,
        creditsPerMonth: role.creditsPerMonth,
        termStartDate:   role.termStartDate?.toISOString() ?? null,
    };
}

// GET /courier/couriers
export function listCouriers(_req: Request, res: Response): void {
    const roles = CourierDomain.getInstance().getRoles().filter(r => r.memberId !== null);
    res.json({ total: roles.length, couriers: roles.map(courierToDto) });
}

// POST /courier/couriers  — body: { memberId, title?, creditsPerMonth }
export function addCourier(req: Request, res: Response): void {
    const { memberId, title, creditsPerMonth } = req.body ?? {};
    if (typeof memberId !== "string" || !memberId.trim()) { res.status(400).json({ error: "memberId is required" }); return; }
    const salary = typeof creditsPerMonth === "number" ? creditsPerMonth : Number(creditsPerMonth ?? 0);
    if (!Number.isFinite(salary) || salary < 0) { res.status(400).json({ error: "creditsPerMonth must be a non-negative number" }); return; }
    if (!MemberService.getInstance().get(memberId)) { res.status(404).json({ error: "Member not found" }); return; }

    const role = new CommunityRole(
        typeof title === "string" && title.trim() ? title.trim() : "Courier",
        "",
        salary,
    );
    role.memberId      = memberId;
    role.termStartDate = new Date();
    CourierDomain.getInstance().addRole(role);
    res.status(201).json(courierToDto(role));
}
