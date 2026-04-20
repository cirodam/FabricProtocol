import { randomUUID } from "crypto";
import { Address } from "./Address.js";

export type LocationType = "community" | "residential" | "external";

export class Location {
    readonly id: string;
    label: string;
    address: Address;
    latitude: number;
    longitude: number;
    type: LocationType;

    /** Optional reference to a HousingUnit, FunctionalUnit, or other entity. */
    linkedEntityId: string | null;
    notes: string;

    readonly createdAt: Date;

    constructor(
        label: string,
        address: Address,
        latitude: number,
        longitude: number,
        type: LocationType = "external",
    ) {
        this.id             = randomUUID();
        this.label          = label;
        this.address        = address;
        this.latitude       = latitude;
        this.longitude      = longitude;
        this.type           = type;
        this.linkedEntityId = null;
        this.notes          = "";
        this.createdAt      = new Date();
    }
}
