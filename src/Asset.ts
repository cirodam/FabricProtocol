import { randomUUID } from "crypto";

export enum AssetUnit {
    UNIT = "UNIT",           // discrete items: firetruck, generator
    KILOGRAM = "KILOGRAM",
    TON = "TON",
    LITER = "LITER",
    SQUARE_METER = "SQUARE_METER",
    USD = "USD",             // US dollars held as a physical resource
}

// An asset is a physical thing owned by the Commons in the public trust.
// Examples: a mill, a generator, a firetruck, 2 tons of rice.
export class Asset {
    readonly id: string;
    name: string;
    description: string;
    quantity: number;
    unit: AssetUnit;
    readonly acquiredAt: Date;

    constructor(name: string, description: string, quantity: number = 1, unit: AssetUnit = AssetUnit.UNIT) {
        this.id = randomUUID();
        this.name = name;
        this.description = description;
        this.quantity = quantity;
        this.unit = unit;
        this.acquiredAt = new Date();
    }
}
