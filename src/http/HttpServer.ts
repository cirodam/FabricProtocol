
import express, { Application } from "express";
import { Server } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
import { MemberService } from "../member/MemberService.js";
import { CentralBank } from "../central_bank/CentralBank.js";
import memberRoutes from "./routes/memberRoutes.js";
import bankRoutes from "./routes/bankRoutes.js";
import centralBankRoutes from "./routes/centralBankRoutes.js";
import marketplaceRoutes from "./routes/marketplaceRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import housingRoutes from "./routes/housingRoutes.js";
import commonwealthRoutes from "./routes/commonwealthRoutes.js";
import healthcareRoutes from "./routes/healthcareRoutes.js";
import educationRoutes from "./routes/educationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import externalReserveRoutes from "./routes/externalReserveRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import courierRoutes from "./routes/courierRoutes.js";
import dependencyCareRoutes from "./routes/dependencyCareRoutes.js";
import networkRoutes from "../network/networkRoutes.js";

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
        this.app.use(express.json({
            verify: (req, _res, buf) => {
                (req as typeof req & { rawBody: string }).rawBody = buf.toString("utf-8");
            },
        }));
        this.registerRoutes();
    }

    private registerRoutes(): void {
        this.app.get("/api/status", (_req, res) => {
            res.json({
                members: MemberService.getInstance().count(),
                moneyInCirculation: CentralBank.getInstance().moneyInCirculation,
            });
        });

        this.app.use("/api/members", memberRoutes);
        this.app.use("/api", bankRoutes);
        this.app.use("/api", centralBankRoutes);
        this.app.use("/api/marketplace", marketplaceRoutes);
        this.app.use("/api/food", foodRoutes);
        this.app.use("/api/housing", housingRoutes);
        this.app.use("/api/commonwealth", commonwealthRoutes);
        this.app.use("/api/healthcare", healthcareRoutes);
        this.app.use("/api/education", educationRoutes);
        this.app.use("/api/admin", adminRoutes);
        this.app.use("/api/external-reserve", externalReserveRoutes);
        this.app.use("/api/locations", locationRoutes);
        this.app.use("/api/courier", courierRoutes);
        this.app.use("/api/dependency-care", dependencyCareRoutes);
        this.app.use("/api/node", networkRoutes);

        // Serve the Svelte frontend (production build)
        const frontendDist = join(__dirname, "../../frontend/dist");
        this.app.use(express.static(frontendDist));
        this.app.get("*splat", (_req, res) => {
            res.sendFile(join(frontendDist, "index.html"));
        });
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
