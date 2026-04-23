
import express, { Application } from "express";
import session from "express-session";
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

import locationRoutes from "./routes/locationRoutes.js";
import courierRoutes from "./routes/courierRoutes.js";
import dependencyCareRoutes from "./routes/dependencyCareRoutes.js";
import childCareRoutes from "./routes/childCareRoutes.js";
import fireRoutes from "./routes/fireRoutes.js";
import deathcareRoutes from "./routes/deathcareRoutes.js";
import transportRoutes from "./routes/transportRoutes.js";
import enrichmentRoutes from "./routes/enrichmentRoutes.js";
import guildRoutes from "./routes/guildRoutes.js";
import councilRoutes from "./routes/councilRoutes.js";
import assemblyRoutes from "./routes/assemblyRoutes.js";
import constitutionRoutes from "./routes/constitutionRoutes.js";
import provisioningRoutes from "./routes/provisioningRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import referendumRoutes from "./routes/referendumRoutes.js";
import communicationsRoutes from "./routes/communicationsRoutes.js";
import agricultureRoutes from "./routes/agricultureRoutes.js";
import sanitationRoutes from "./routes/sanitationRoutes.js";
import waterRoutes from "./routes/waterRoutes.js";
import networkRoutes from "../network/networkRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import currencyBoardRoutes from "./routes/currencyBoardRoutes.js";
import socialInsuranceRoutes from "./routes/socialInsuranceRoutes.js";
import unitRoutes from "./routes/unitRoutes.js";
import setupRoutes from "./routes/setupRoutes.js";

/**
 * HTTP REST API server.
 * Provides a JSON interface for the web portal and admin tools.
 *
 * Mounted routes:
 *   GET    /status                            — community summary
 *   GET    /money-supply                      — kin in circulation
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
        this.app.use(session({
            secret: process.env.SESSION_SECRET ?? "change-me-in-production",
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                sameSite: "strict",
                // secure: true — enable when served over HTTPS
            },
        }));
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

        this.app.use("/api/setup", setupRoutes);
        this.app.use("/api/members", memberRoutes);
        this.app.use("/api", bankRoutes);
        this.app.use("/api", centralBankRoutes);
        this.app.use("/api/marketplace", marketplaceRoutes);
        this.app.use("/api/food", foodRoutes);
        this.app.use("/api/housing", housingRoutes);
        this.app.use("/api/community", commonwealthRoutes);
        this.app.use("/api/healthcare", healthcareRoutes);
        this.app.use("/api/education", educationRoutes);
        this.app.use("/api/admin", adminRoutes);
        this.app.use("/api/domains/:domainId/units", unitRoutes);
        this.app.use("/api/locations", locationRoutes);
        this.app.use("/api/courier", courierRoutes);
        this.app.use("/api/dependency-care", dependencyCareRoutes);
        this.app.use("/api/child-care", childCareRoutes);
        this.app.use("/api/fire", fireRoutes);
        this.app.use("/api/deathcare", deathcareRoutes);
        this.app.use("/api/transport", transportRoutes);
        this.app.use("/api/enrichment", enrichmentRoutes);
        this.app.use("/api/guilds", guildRoutes);
        this.app.use("/api/councils", councilRoutes);
        this.app.use("/api/assembly", assemblyRoutes);
        this.app.use("/api/constitution", constitutionRoutes);
        this.app.use("/api/provisioning", provisioningRoutes);
        this.app.use("/api/applications", applicationRoutes);
        this.app.use("/api/communications", communicationsRoutes);
        this.app.use("/api/agriculture", agricultureRoutes);
        this.app.use("/api/sanitation", sanitationRoutes);
        this.app.use("/api/water", waterRoutes);
        this.app.use("/api/calendar", calendarRoutes);
        this.app.use("/api/messages", messageRoutes);
        this.app.use("/api/referenda", referendumRoutes);
        this.app.use("/api/node", networkRoutes);
        this.app.use("/api/auth", authRoutes);
        this.app.use("/api/currency-board", currencyBoardRoutes);
        this.app.use("/api/social-insurance", socialInsuranceRoutes);

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
