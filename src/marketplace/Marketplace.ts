import { Post } from "./Post.js";
import { Bank } from "../bank/Bank.js";
import { TraderProfile } from "./TraderProfile.js";
import { PostLoader } from "./PostLoader.js";
import { TraderProfileLoader } from "./TraderProfileLoader.js";

export class Marketplace {
    private static instance: Marketplace;

    private posts: Post[] = [];
    private traders: Map<string, TraderProfile> = new Map();
    private postLoader: PostLoader | null = null;
    private traderLoader: TraderProfileLoader | null = null;

    private constructor() {}

    /**
     * Set the persistence layers and load all posts and trader profiles from disk.
     * Call once at app startup before any other operations.
     */
    init(postLoader: PostLoader, traderLoader: TraderProfileLoader): void {
        this.postLoader = postLoader;
        this.traderLoader = traderLoader;
        this.posts = postLoader.loadAll();
        for (const profile of traderLoader.loadAll()) {
            this.traders.set(profile.id, profile);
        }
    }

    static getInstance(): Marketplace {
        if (!Marketplace.instance) {
            Marketplace.instance = new Marketplace();
        }
        return Marketplace.instance;
    }

    // --- Trader Registry ---

    registerTrader(profile: TraderProfile): void {
        const existing = this.getTraderByHandle(profile.handle);
        if (existing && existing.id !== profile.id) {
            throw new Error(`Handle "${profile.handle}" is already taken`);
        }
        this.traders.set(profile.id, profile);
        this.traderLoader?.save(profile);
    }

    getTrader(traderId: string): TraderProfile | undefined {
        return this.traders.get(traderId);
    }

    getTraderByHandle(handle: string): TraderProfile | undefined {
        const normalized = handle.toLowerCase().replace(/[^a-z0-9_]/g, "");
        return Array.from(this.traders.values()).find(t => t.handle === normalized);
    }

    getTraders(): TraderProfile[] {
        return Array.from(this.traders.values());
    }

    // --- Posting ---

    addPost(post: Post): void {
        this.posts.push(post);
        this.postLoader?.save(post);
    }

    removePost(postId: string): void {
        this.posts = this.posts.filter(p => p.id !== postId);
        this.postLoader?.delete(postId);
    }

    // --- Querying ---

    getPosts(filter: { type?: Post["type"]; side?: Post["side"]; category?: string } = {}): Post[] {
        return this.posts.filter(p => {
            if (filter.type && p.type !== filter.type) return false;
            if (filter.side && p.side !== filter.side) return false;
            if (filter.category && p.category !== filter.category) return false;
            if (p.type === "item" && (p.quantity ?? 0) <= 0) return false;
            return true;
        });
    }

    getPost(postId: string): Post | undefined {
        return this.posts.find(p => p.id === postId);
    }

    // Returns posts on the opposite side in the same category with a compatible price.
    getMatches(post: Post): Post[] {
        const oppositeSide = post.side === "offer" ? "request" : "offer";
        return this.posts.filter(p => {
            if (p.id === post.id) return false;
            if (p.type !== post.type) return false;
            if (p.side !== oppositeSide) return false;
            if (p.category !== post.category) return false;
            if (p.type === "item" && (p.quantity ?? 0) <= 0) return false;
            const offer   = post.side === "offer" ? post : p;
            const request = post.side === "request" ? post : p;
            return offer.price <= request.price;
        });
    }

    // --- Fulfillment ---

    /**
     * Settle a trade between an offer and a request.
     * For item posts, pass quantity (defaults to the smaller of the two remainders).
     * For service posts, quantity is ignored — the full price is transferred.
     */
    fulfill(offerId: string, requestId: string, quantity?: number): void {
        const offer   = this.posts.find(p => p.id === offerId);
        const request = this.posts.find(p => p.id === requestId);
        if (!offer)   throw new Error(`Post ${offerId} not found`);
        if (!request) throw new Error(`Post ${requestId} not found`);
        if (offer.side !== "offer")     throw new Error(`Post ${offerId} is not an offer`);
        if (request.side !== "request") throw new Error(`Post ${requestId} is not a request`);
        if (offer.type !== request.type) throw new Error("Post type mismatch");
        if (offer.category !== request.category) throw new Error("Category mismatch");
        if (offer.price > request.price) throw new Error("Offer price exceeds request price");

        const bankInst = Bank.getInstance();
        const payerAccount = bankInst.getPrimaryAccount(request.posterId);
        const payeeAccount = bankInst.getPrimaryAccount(offer.posterId);
        if (!payerAccount) throw new Error(`No primary account for requester ${request.posterId}`);
        if (!payeeAccount) throw new Error(`No primary account for offerer ${offer.posterId}`);

        if (offer.type === "item") {
            const qty = quantity ?? Math.min(offer.quantity ?? 0, request.quantity ?? 0);
            if (qty <= 0) throw new Error("Quantity must be positive");
            if (qty > (offer.quantity ?? 0))   throw new Error("Quantity exceeds offer supply");
            if (qty > (request.quantity ?? 0)) throw new Error("Quantity exceeds request demand");
            const total = Math.round(offer.price * qty * 100) / 100;
            bankInst.transfer(payerAccount.id, payeeAccount.id, "credits", total,
                `marketplace: ${qty}x ${offer.category} @ ${offer.price}`);
            offer.quantity   = (offer.quantity   ?? 0) - qty;
            request.quantity = (request.quantity ?? 0) - qty;
            this.postLoader?.save(offer);
            this.postLoader?.save(request);
        } else {
            bankInst.transfer(payerAccount.id, payeeAccount.id, "credits", offer.price,
                `marketplace: service ${offer.category}`);
        }
    }
}
