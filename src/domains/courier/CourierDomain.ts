import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { DeliveryRequest } from "./DeliveryRequest.js";
import { DeliveryRequestLoader } from "./DeliveryRequestLoader.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

/**
 * The Courier domain handles the movement of physical goods and documents within
 * the community using salaried couriers in personal vehicles.
 *
 * There are no fixed routes. Instead, the domain maintains an open request queue.
 * Couriers pick up pending requests and mark them completed when delivered.
 * Urgent requests (same-day) are surfaced above regular ones in the queue.
 *
 * Couriers are community members paid a monthly credit salary — the community pays
 * for readiness and reliability, not per-delivery throughput.
 */
export class CourierDomain extends FunctionalDomain {
    private static readonly DOMAIN_ID = "00000000-0000-0000-0000-000000000010";
    private static instance: CourierDomain;

    private requests: Map<string, DeliveryRequest> = new Map();
    private requestLoader: DeliveryRequestLoader | null = null;

    private constructor() {
        super("Courier", "Moves physical goods and documents within the community on demand.", CourierDomain.DOMAIN_ID);
        this.addRole(new CommunityRole("Courier Coordinator", "Manages courier scheduling, delivery queue, and courier staff.", 700));
    }

    static getInstance(): CourierDomain {
        if (!CourierDomain.instance) {
            CourierDomain.instance = new CourierDomain();
        }
        return CourierDomain.instance;
    }

    initRequests(loader: DeliveryRequestLoader): void {
        this.requestLoader = loader;
        for (const r of loader.loadAll()) {
            this.requests.set(r.id, r);
        }
    }

    addRequest(request: DeliveryRequest): void {
        this.requests.set(request.id, request);
        this.requestLoader?.save(request);
    }

    saveRequest(request: DeliveryRequest): void {
        this.requestLoader?.save(request);
    }

    getRequest(id: string): DeliveryRequest | undefined {
        return this.requests.get(id);
    }

    getAllRequests(): DeliveryRequest[] {
        return Array.from(this.requests.values());
    }

    getPendingRequests(): DeliveryRequest[] {
        return this.getAllRequests().filter(r => r.isPending);
    }

    getUrgentPendingRequests(): DeliveryRequest[] {
        return this.getPendingRequests().filter(r => r.isUrgent);
    }

    completeRequest(requestId: string): void {
        const req = this.requests.get(requestId);
        if (!req) throw new Error(`Request ${requestId} not found`);
        req.status      = "completed";
        req.completedAt = new Date();
        this.requestLoader?.save(req);
    }

    cancelRequest(requestId: string): void {
        const req = this.requests.get(requestId);
        if (!req) throw new Error(`Request ${requestId} not found`);
        req.status = "cancelled";
        this.requestLoader?.save(req);
    }

    removeRequest(id: string): void {
        this.requests.delete(id);
        this.requestLoader?.delete(id);
    }
}

