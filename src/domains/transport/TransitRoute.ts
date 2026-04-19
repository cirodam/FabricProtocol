import { randomUUID } from "crypto";

/**
 * A TransitRoute is a fixed, repeating path through the community served by a
 * single operator on a regular schedule. Routes are sized to fill one operator's
 * working day and run the same sequence of stops each cycle.
 */
export class TransitRoute {
    readonly id: string;
    name: string;
    description: string;
    stops: string[];
    operatorId: string | null;
    scheduleDescription: string;

    constructor(
        name: string,
        description: string = "",
        stops: string[] = [],
        scheduleDescription: string = "",
        operatorId: string | null = null,
        id?: string,
    ) {
        this.id = id ?? randomUUID();
        this.name = name;
        this.description = description;
        this.stops = stops;
        this.scheduleDescription = scheduleDescription;
        this.operatorId = operatorId;
    }
}
