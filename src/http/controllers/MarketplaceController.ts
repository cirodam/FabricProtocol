import { Request, Response } from "express";
import { Marketplace } from "../../marketplace/Marketplace.js";
import { Post, PostSide, PostType, PricingUnit } from "../../marketplace/Post.js";
import { MemberService } from "../../member/MemberService.js";
import { Bank } from "../../bank/Bank.js";

const market = () => Marketplace.getInstance();

const POST_TYPES:    PostType[]    = ["item", "service"];
const POST_SIDES:    PostSide[]    = ["offer", "request"];
const PRICING_UNITS: PricingUnit[] = ["per_hour", "in_total"];

// GET /posts?type=&side=&category=
export function listPosts(req: Request, res: Response): void {
    const { type, side, category } = req.query;
    const filter: { type?: PostType; side?: PostSide; category?: string } = {};

    if (type !== undefined) {
        if (!POST_TYPES.includes(type as PostType)) {
            res.status(400).json({ error: `type must be one of: ${POST_TYPES.join(", ")}` });
            return;
        }
        filter.type = type as PostType;
    }
    if (side !== undefined) {
        if (!POST_SIDES.includes(side as PostSide)) {
            res.status(400).json({ error: `side must be one of: ${POST_SIDES.join(", ")}` });
            return;
        }
        filter.side = side as PostSide;
    }
    if (typeof category === "string") filter.category = category;

    res.json(market().getPosts(filter).map(toPostDto));
}

// GET /posts/:id
export function getPost(req: Request, res: Response): void {
    const post = market().getPost(req.params.id as string);
    if (!post) { res.status(404).json({ error: "Post not found" }); return; }
    res.json(toPostDto(post));
}

// POST /posts
export function createPost(req: Request, res: Response): void {
    const { posterId, type, side, category, title, description, price, quantity, pricingUnit } = req.body ?? {};

    if (typeof posterId !== "string" || !posterId) {
        res.status(400).json({ error: "posterId is required" }); return;
    }
    if (!POST_TYPES.includes(type)) {
        res.status(400).json({ error: `type must be one of: ${POST_TYPES.join(", ")}` }); return;
    }
    if (!POST_SIDES.includes(side)) {
        res.status(400).json({ error: `side must be one of: ${POST_SIDES.join(", ")}` }); return;
    }
    if (typeof category !== "string" || !category) {
        res.status(400).json({ error: "category is required" }); return;
    }
    if (typeof title !== "string" || !title) {
        res.status(400).json({ error: "title is required" }); return;
    }
    if (typeof description !== "string") {
        res.status(400).json({ error: "description is required" }); return;
    }
    if (typeof price !== "number" || price < 0) {
        res.status(400).json({ error: "price must be a non-negative number" }); return;
    }
    if (type === "item" && (typeof quantity !== "number" || quantity <= 0)) {
        res.status(400).json({ error: "quantity must be a positive number for item posts" }); return;
    }
    if (type === "service" && pricingUnit !== undefined && !PRICING_UNITS.includes(pricingUnit)) {
        res.status(400).json({ error: `pricingUnit must be one of: ${PRICING_UNITS.join(", ")}` }); return;
    }

    // Resolve the poster — must be a known member with a primary account
    const poster = MemberService.getInstance().get(posterId);
    if (!poster) {
        res.status(422).json({ error: "posterId does not match a known member" }); return;
    }
    if (!Bank.getInstance().getPrimaryAccount(posterId)) {
        res.status(422).json({ error: "poster has no primary bank account" }); return;
    }

    const post = new Post(posterId, poster.getDisplayName(), poster.getHandle(), type, side, category, title, description, price, {
        quantity: type === "item" ? quantity : undefined,
        pricingUnit: type === "service" ? (pricingUnit ?? "in_total") : undefined,
    });
    market().addPost(post);
    res.status(201).json(toPostDto(post));
}

// DELETE /posts/:id
export function deletePost(req: Request, res: Response): void {
    const post = market().getPost(req.params.id as string);
    if (!post) { res.status(404).json({ error: "Post not found" }); return; }
    market().removePost(post.id);
    res.status(204).end();
}

// POST /posts/fulfill
// Body: { offerId, requestId, quantity? }
export function fulfillTrade(req: Request, res: Response): void {
    const { offerId, requestId, quantity } = req.body ?? {};

    if (typeof offerId !== "string" || !offerId) {
        res.status(400).json({ error: "offerId is required" }); return;
    }
    if (typeof requestId !== "string" || !requestId) {
        res.status(400).json({ error: "requestId is required" }); return;
    }
    if (quantity !== undefined && (typeof quantity !== "number" || quantity <= 0)) {
        res.status(400).json({ error: "quantity must be a positive number" }); return;
    }

    try {
        market().fulfill(offerId, requestId, quantity);
        res.status(204).end();
    } catch (err) {
        res.status(422).json({ error: (err as Error).message });
    }
}

function toPostDto(p: Post) {
    return {
        id:           p.id,
        posterId:     p.posterId,
        posterName:   p.posterName,
        posterHandle: p.posterHandle,
        type:         p.type,
        side:         p.side,
        category:     p.category,
        title:        p.title,
        description:  p.description,
        price:        p.price,
        quantity:     p.quantity,
        pricingUnit:  p.pricingUnit,
        createdAt:    p.createdAt,
    };
}



