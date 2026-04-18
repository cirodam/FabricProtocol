import { randomUUID } from "crypto";

export type PostSide = "offer" | "request";
export type PostType = "item" | "service";
export type PricingUnit = "per_hour" | "in_total";

export class Post {
    readonly id: string;
    readonly posterId: string;
    readonly posterName: string;
    readonly posterHandle: string;
    readonly type: PostType;
    readonly side: PostSide;
    readonly category: string;
    title: string;
    description: string;
    price: number;
    readonly createdAt: Date;

    /** Items only: remaining quantity available. Undefined for service posts. */
    quantity?: number;

    /** Services only: how the price is denominated. Undefined for item posts. */
    pricingUnit?: PricingUnit;

    constructor(
        posterId: string,
        posterName: string,
        posterHandle: string,
        type: PostType,
        side: PostSide,
        category: string,
        title: string,
        description: string,
        price: number,
        options: { quantity?: number; pricingUnit?: PricingUnit } = {}
    ) {
        this.id = randomUUID();
        this.posterId = posterId;
        this.posterName = posterName;
        this.posterHandle = posterHandle;
        this.type = type;
        this.side = side;
        this.category = category;
        this.title = title;
        this.description = description;
        this.price = price;
        this.createdAt = new Date();
        this.quantity = options.quantity;
        this.pricingUnit = options.pricingUnit;
    }
}
