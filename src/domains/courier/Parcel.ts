import { randomUUID } from "crypto";

/**
 * A Parcel is a physical item to be delivered from one community member (or domain)
 * to another. Parcels are created when a Marketplace transaction involves a physical
 * good, or when any member or domain needs to send something to another address.
 */
export class Parcel {
    readonly id: string;
    readonly senderId: string;
    readonly recipientId: string;
    readonly description: string;
    routeId: string | null;
    readonly createdAt: Date;
    deliveredAt: Date | null;

    constructor(
        senderId: string,
        recipientId: string,
        description: string,
        routeId: string | null = null,
        id?: string,
        createdAt?: Date,
    ) {
        this.id = id ?? randomUUID();
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.description = description;
        this.routeId = routeId;
        this.createdAt = createdAt ?? new Date();
        this.deliveredAt = null;
    }

    get isPending(): boolean {
        return this.deliveredAt === null;
    }
}
