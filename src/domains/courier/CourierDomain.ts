import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { DeliveryRoute } from "./DeliveryRoute.js";
import { Parcel } from "./Parcel.js";

/**
 * The Courier domain handles the movement of physical goods within the community.
 *
 * Rather than depending on individual car ownership or commercial delivery services,
 * the community employs carriers who walk or bike fixed routes on a regular schedule.
 * This makes last-mile logistics a public service — visible, compensable through payroll,
 * and governed by the community.
 *
 * Routes are sized to fill one carrier's working day and are walked in the same order
 * each cycle, matching the USPS carrier route model. All carriers are community members.
 *
 * Scope includes: Marketplace item delivery, inter-domain goods movement, official
 * Commons notices and documents, and accessibility transport coordination with the
 * Dependency Care domain for members who cannot self-transport.
 *
 * In a federation context, carriers may also run inter-community routes for physical
 * goods and documents exchanged between Commons nodes.
 */
export class CourierDomain extends FunctionalDomain {
    private routes: Map<string, DeliveryRoute> = new Map();
    private parcels: Map<string, Parcel> = new Map();

    constructor() {
        super("Courier", "Handles the movement of physical goods and documents within the community.");
    }

    // ── Routes ─────────────────────────────────────────────────────────────────

    addRoute(name: string, description: string = ""): DeliveryRoute {
        const route = new DeliveryRoute(name, description);
        this.routes.set(route.id, route);
        return route;
    }

    assignCarrier(routeId: string, carrierId: string): void {
        const route = this.routes.get(routeId);
        if (!route) throw new Error(`Route ${routeId} not found`);
        route.carrierId = carrierId;
    }

    getRoutes(): DeliveryRoute[] {
        return Array.from(this.routes.values());
    }

    getUnassignedRoutes(): DeliveryRoute[] {
        return this.getRoutes().filter(r => r.carrierId === null);
    }

    // ── Parcels ────────────────────────────────────────────────────────────────

    createParcel(senderId: string, recipientId: string, description: string, routeId: string | null = null): Parcel {
        const parcel = new Parcel(senderId, recipientId, description, routeId);
        this.parcels.set(parcel.id, parcel);
        return parcel;
    }

    assignParcelToRoute(parcelId: string, routeId: string): void {
        const parcel = this.parcels.get(parcelId);
        if (!parcel) throw new Error(`Parcel ${parcelId} not found`);
        if (!this.routes.has(routeId)) throw new Error(`Route ${routeId} not found`);
        parcel.routeId = routeId;
    }

    markDelivered(parcelId: string): void {
        const parcel = this.parcels.get(parcelId);
        if (!parcel) throw new Error(`Parcel ${parcelId} not found`);
        parcel.deliveredAt = new Date();
    }

    getPendingParcels(): Parcel[] {
        return Array.from(this.parcels.values()).filter(p => p.isPending);
    }

    getParcelsByRoute(routeId: string): Parcel[] {
        return Array.from(this.parcels.values()).filter(p => p.routeId === routeId);
    }

    getParcel(parcelId: string): Parcel | undefined {
        return this.parcels.get(parcelId);
    }
}
