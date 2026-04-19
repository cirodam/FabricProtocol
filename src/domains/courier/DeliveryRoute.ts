import { randomUUID } from "crypto";

/**
 * A DeliveryRoute is a fixed sequence of stops covered by a single carrier.
 * Routes are sized to fill one carrier's working day and are walked or biked
 * in the same order each delivery cycle. Carriers are community members
 * compensated through the normal payroll system.
 */
export class DeliveryRoute {
    readonly id: string;
    name: string;
    description: string;
    carrierId: string | null;

    constructor(name: string, description: string = "", carrierId: string | null = null, id?: string) {
        this.id = id ?? randomUUID();
        this.name = name;
        this.description = description;
        this.carrierId = carrierId;
    }
}
