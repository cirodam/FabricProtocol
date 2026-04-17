import { randomUUID } from "crypto";

export type PostSide = "offer" | "request";

export class ItemPost {
    readonly id: string;
    readonly posterId: string;  // member or commons
    readonly side: PostSide;
    readonly category: string;
    title: string;
    description: string;
    price: number;     // per unit
    quantity: number;  // remaining
    readonly createdAt: Date;

    constructor(
        posterId: string,
        side: PostSide,
        category: string,
        title: string,
        description: string,
        price: number,
        quantity: number,
    ) {
        this.id = randomUUID();
        this.posterId = posterId;
        this.side = side;
        this.category = category;
        this.title = title;
        this.description = description;
        this.price = price;
        this.quantity = quantity;
        this.createdAt = new Date();
    }
}
