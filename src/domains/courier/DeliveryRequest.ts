import { randomUUID } from "crypto";

export type DeliveryPriority = "regular" | "urgent";
export type DeliveryStatus   = "pending" | "in-progress" | "completed" | "cancelled";

/**
 * A DeliveryRequest is a community member's ask for something to be moved from
 * one location to another by a courier. Requests are demand-responsive — there are
 * no fixed routes. The courier service picks up the open queue and batches runs
 * on the fly.
 *
 * Priority:
 *   - "urgent"  — must be delivered today (medication, perishables, time-sensitive)
 *   - "regular" — deliver when possible; can be batched with other nearby requests
 *
 * Locations reference the community's LocationRegistry by ID.
 */
export class DeliveryRequest {
    readonly id: string;
    readonly requesterId: string;
    readonly description: string;
    readonly originLocationId: string;
    readonly destinationLocationId: string;
    readonly priority: DeliveryPriority;
    status: DeliveryStatus;
    readonly createdAt: Date;
    completedAt: Date | null;

    constructor(
        requesterId: string,
        description: string,
        originLocationId: string,
        destinationLocationId: string,
        priority: DeliveryPriority = "regular",
        id?: string,
        createdAt?: Date,
    ) {
        this.id                    = id ?? randomUUID();
        this.requesterId           = requesterId;
        this.description           = description;
        this.originLocationId      = originLocationId;
        this.destinationLocationId = destinationLocationId;
        this.priority              = priority;
        this.status                = "pending";
        this.createdAt             = createdAt ?? new Date();
        this.completedAt           = null;
    }

    get isPending(): boolean    { return this.status === "pending"; }
    get isUrgent(): boolean     { return this.priority === "urgent"; }
    get isComplete(): boolean   { return this.status === "completed"; }
}
