
import express, { Application } from "express";
import { Server } from "http";
import { MemberService } from "../member/MemberService.js";
import { CentralBank } from "../central_bank/CentralBank.js";
import memberRoutes from "./routes/memberRoutes.js";
import bankRoutes from "./routes/bankRoutes.js";
import centralBankRoutes from "./routes/centralBankRoutes.js";
import marketplaceRoutes from "./routes/marketplaceRoutes.js";

/**
 * HTTP REST API server.
 * Provides a JSON interface for the web portal and admin tools.
 *
 * Mounted routes:
 *   GET    /status                            — community summary
 *   GET    /money-supply                      — credits in circulation
 *
 *   GET    /members                           — list all members
 *   GET    /members/:id                       — get member by ID
 *   POST   /members                           — register new member
 *   PATCH  /members/:id                       — update member fields
 *
 *   GET    /accounts/:ownerId                 — all accounts for an owner
 *   GET    /accounts/:accountId/transactions  — transaction history (?month=YYYY-MM)
 *   POST   /transfers                         — transfer between accounts
 *
 *   GET    /marketplace/posts                 — list posts (?type=&side=&category=)
 *   POST   /marketplace/posts                 — create post
 *   POST   /marketplace/posts/fulfill         — settle a trade
 *   GET    /marketplace/posts/:id             — get post by ID
 *   DELETE /marketplace/posts/:id             — remove post
 *   GET    /marketplace/traders               — list traders
 *   POST   /marketplace/traders               — register trader
 *   GET    /marketplace/traders/:id           — get trader by ID
 *
 * All write endpoints require authentication (TODO: PIN + session token).
 */
export class HttpServer {
    private app: Application;
    private server: Server | null = null;

    constructor(private readonly port: number = 3000) {
        this.app = express();
        this.app.use(express.json());
        this.registerRoutes();
    }

    private registerRoutes(): void {
        this.app.get("/status", (_req, res) => {
            res.json({
                members: MemberService.getInstance().count(),
                moneyInCirculation: CentralBank.getInstance().moneyInCirculation,
            });
        });

        this.app.use("/members", memberRoutes);
        this.app.use("/", bankRoutes);
        this.app.use("/", centralBankRoutes);
        this.app.use("/marketplace", marketplaceRoutes);
    }

    start(): void {
        this.server = this.app.listen(this.port, () => {
            console.log(`[http] API listening on port ${this.port}`);
        });
    }

    stop(): void {
        this.server?.close();
    }
}
