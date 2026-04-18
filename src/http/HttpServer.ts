import { MemberService } from "../member/MemberService.js";
import { Bank } from "../bank/Bank.js";
import { CentralBank } from "../central_bank/CentralBank.js";
import { Marketplace } from "../marketplace/Marketplace.js";

/**
 * HTTP REST API server.
 * Provides a JSON interface for the web portal and admin tools.
 *
 * Requires: npm install express @types/express
 *
 * Planned routes:
 *
 *   GET  /status                  — community summary (member count, money in circulation)
 *
 *   GET  /members                 — list all members
 *   GET  /members/:id             — get member by ID
 *   POST /members                 — register new member (admin)
 *
 *   GET  /accounts/:ownerId       — get accounts for owner
 *   GET  /accounts/:id/transactions — transaction history
 *
 *   POST /transfers               — create a transfer { from, to, amount, currency, memo }
 *
 *   GET  /marketplace/posts       — list active posts (?type=&side=&category=)
 *   POST /marketplace/posts       — create a post
 *   DELETE /marketplace/posts/:id — remove a post
 *   POST /marketplace/fulfill     — fulfill a trade { offerId, requestId, quantity? }
 *
 *   GET  /marketplace/traders     — list trader profiles
 *   POST /marketplace/traders     — register a trader profile
 *
 * All write endpoints require authentication (PIN + session token — TODO).
 */
export class HttpServer {
  // TODO: replace with: import express, { Request, Response } from "express";
  private app: unknown = null;

  constructor(private readonly port: number = 3000) {}

  start(): void {
    // TODO:
    // this.app = express();
    // this.app.use(express.json());
    //
    // this.app.get("/status", (_req, res) => {
    //   const memberService = MemberService.getInstance();
    //   const bank = CentralBank.getInstance();
    //   res.json({
    //     members: memberService.count(),
    //     moneyInCirculation: bank.moneyInCirculation,
    //   });
    // });
    //
    // this.app.get("/members", (_req, res) => {
    //   res.json(MemberService.getInstance().getAll());
    // });
    //
    // ... (see planned routes above)
    //
    // this.app.listen(this.port, () =>
    //   console.log(`[http] API listening on port ${this.port}`)
    // );
    console.log(`[http] TODO: start REST API on port ${this.port}`);
  }

  stop(): void {
    // TODO: close server
  }
}
