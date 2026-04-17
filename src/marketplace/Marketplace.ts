import { ItemPost } from "./ItemPost.js";
import { ServicePost } from "./ServicePost.js";
import { Bank } from "../bank/Bank.js";
import { TraderProfile } from "./TraderProfile.js";

export class Marketplace {
    private static instance: Marketplace;

    private itemPosts: ItemPost[] = [];
    private servicePosts: ServicePost[] = [];
    private traders: Map<string, TraderProfile> = new Map(); // keyed by TraderProfile.id

    private constructor() {}

    static getInstance(): Marketplace {
        if (!Marketplace.instance) {
            Marketplace.instance = new Marketplace();
        }
        return Marketplace.instance;
    }

    // --- Trader Registry ---

    registerTrader(profile: TraderProfile): void {
        this.traders.set(profile.id, profile);
    }

    getTrader(traderId: string): TraderProfile | undefined {
        return this.traders.get(traderId);
    }

    getTraders(): TraderProfile[] {
        return Array.from(this.traders.values());
    }

    // --- Posting ---

    addItemPost(post: ItemPost): void {
        this.itemPosts.push(post);
    }

    addServicePost(post: ServicePost): void {
        this.servicePosts.push(post);
    }

    // --- Querying ---

    getItemPosts(): ItemPost[] {
        return this.itemPosts.filter((p) => p.quantity > 0);
    }

    getServicePosts(): ServicePost[] {
        return [...this.servicePosts];
    }

    // Returns offers that match a request, or requests that match an offer.
    // Matches on same category, opposite side, compatible price
    // (offer.price <= request.price).
    getItemMatches(post: ItemPost): ItemPost[] {
        const oppositeSide = post.side === "offer" ? "request" : "offer";
        return this.itemPosts.filter((p) => {
            if (p.id === post.id) return false;
            if (p.side !== oppositeSide) return false;
            if (p.category !== post.category) return false;
            if (p.quantity <= 0) return false;
            const offer  = post.side === "offer" ? post : p;
            const request = post.side === "request" ? post : p;
            return offer.price <= request.price;
        });
    }

    getServiceMatches(post: ServicePost): ServicePost[] {
        const oppositeSide = post.side === "offer" ? "request" : "offer";
        return this.servicePosts.filter((p) => {
            if (p.id === post.id) return false;
            if (p.side !== oppositeSide) return false;
            if (p.category !== post.category) return false;
            const offer   = post.side === "offer" ? post : p;
            const request = post.side === "request" ? post : p;
            return offer.price <= request.price;
        });
    }

    // --- Fulfillment ---

    // Settle an item trade: payer (requester) sends credits to payee (offerer).
    // quantity defaults to the smaller of the two posts' remaining quantities.
    fulfillItem(offerId: string, requestId: string, quantity?: number): void {
        const offer   = this.itemPosts.find((p) => p.id === offerId);
        const request = this.itemPosts.find((p) => p.id === requestId);
        if (!offer)   throw new Error(`Offer ${offerId} not found`);
        if (!request) throw new Error(`Request ${requestId} not found`);
        if (offer.side !== "offer")   throw new Error(`Post ${offerId} is not an offer`);
        if (request.side !== "request") throw new Error(`Post ${requestId} is not a request`);
        if (offer.category !== request.category) throw new Error("Category mismatch");
        if (offer.price > request.price) throw new Error("Offer price exceeds request price");

        const qty = quantity ?? Math.min(offer.quantity, request.quantity);
        if (qty <= 0) throw new Error("Quantity must be positive");
        if (qty > offer.quantity)   throw new Error("Quantity exceeds offer supply");
        if (qty > request.quantity) throw new Error("Quantity exceeds request demand");

        const total = Math.round(offer.price * qty * 100) / 100;
        const bankInst = Bank.getInstance();
        const payerAccount = bankInst.getPrimaryAccount(request.posterId);
        const payeeAccount = bankInst.getPrimaryAccount(offer.posterId);
        if (!payerAccount) throw new Error(`No primary account for requester ${request.posterId}`);
        if (!payeeAccount) throw new Error(`No primary account for offerer ${offer.posterId}`);

        bankInst.transfer(payerAccount.id, payeeAccount.id, "credits", total,
            `marketplace: ${qty}x ${offer.category} @ ${offer.price}`);

        offer.quantity   -= qty;
        request.quantity -= qty;
    }

    // Settle a service engagement: payer (requester) sends credits to payee (offerer).
    fulfillService(offerId: string, requestId: string): void {
        const offer   = this.servicePosts.find((p) => p.id === offerId);
        const request = this.servicePosts.find((p) => p.id === requestId);
        if (!offer)   throw new Error(`Offer ${offerId} not found`);
        if (!request) throw new Error(`Request ${requestId} not found`);
        if (offer.side !== "offer")     throw new Error(`Post ${offerId} is not an offer`);
        if (request.side !== "request") throw new Error(`Post ${requestId} is not a request`);
        if (offer.category !== request.category) throw new Error("Category mismatch");
        if (offer.price > request.price) throw new Error("Offer price exceeds request price");

        const bankInst = Bank.getInstance();
        const payerAccount = bankInst.getPrimaryAccount(request.posterId);
        const payeeAccount = bankInst.getPrimaryAccount(offer.posterId);
        if (!payerAccount) throw new Error(`No primary account for requester ${request.posterId}`);
        if (!payeeAccount) throw new Error(`No primary account for offerer ${offer.posterId}`);

        bankInst.transfer(payerAccount.id, payeeAccount.id, "credits", offer.price,
            `marketplace: service ${offer.category}`);
    }
}
