import { Request, Response } from "express";
import { ExternalReserveDomain } from "../../domains/external_reserve/ExternalReserveDomain.js";

const domain = () => ExternalReserveDomain.getInstance();

// GET /external-reserve
export function getStatus(_req: Request, res: Response): void {
    res.json(domain().toStatus());
}

// POST /external-reserve/buy-rate
// Body: { rate: number }
export function setBuyRate(req: Request, res: Response): void {
    const { rate } = req.body ?? {};
    if (typeof rate !== "number" || rate <= 0) {
        res.status(400).json({ error: "rate must be a positive number" });
        return;
    }
    domain().setBuyRate(rate);
    res.json(domain().toStatus());
}

// POST /external-reserve/buy-order/activate
export function activateBuyOrder(_req: Request, res: Response): void {
    domain().activateBuyOrder();
    res.json(domain().toStatus());
}

// POST /external-reserve/buy-order/deactivate
export function deactivateBuyOrder(_req: Request, res: Response): void {
    domain().deactivateBuyOrder();
    res.json(domain().toStatus());
}
