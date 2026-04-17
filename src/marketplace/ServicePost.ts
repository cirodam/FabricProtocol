import { randomUUID } from "crypto";
import { PostSide } from "./ItemPost.js";

export enum PricingUnit {
    PER_HOUR = "PER_HOUR",
    IN_TOTAL = "IN_TOTAL",
}

export class ServicePost {
    readonly id: string;
    readonly posterId: string;  // member or commons
    readonly side: PostSide;
    readonly category: string;
    title: string;
    description: string;
    price: number;
    unit: PricingUnit;
    readonly createdAt: Date;

    constructor(
        posterId: string,
        side: PostSide,
        category: string,
        title: string,
        description: string,
        price: number,
        unit: PricingUnit,
    ) {
        this.id = randomUUID();
        this.posterId = posterId;
        this.side = side;
        this.category = category;
        this.title = title;
        this.description = description;
        this.price = price;
        this.unit = unit;
        this.createdAt = new Date();
    }
}
