import { Community } from "./Community.js";
import { CentralBank } from "./central_bank/CentralBank.js";
import { MemberService } from "./member/MemberService.js";
import { MemberLoader } from "./member/MemberLoader.js";
import { Bank } from "./bank/Bank.js";
import { AccountLoader } from "./bank/AccountLoader.js";
import { TransactionLoader } from "./bank/TransactionLoader.js";
import { MemberEndowmentLoader } from "./central_bank/MemberEndowmentLoader.js";
import { Marketplace } from "./marketplace/Marketplace.js";
import { PostLoader } from "./marketplace/PostLoader.js";
import { Scheduler, every } from "./scheduler/Scheduler.js";
import { PayrollService } from "./commons/PayrollService.js";
import { HttpServer } from "./http/HttpServer.js";
import { NodeService } from "./network/NodeService.js";
import { type NodeType } from "./network/NodeIdentity.js";


async function init(): Promise<void> {
  // ── Persistence ─────────────────────────────────────────────────────────────
  Bank.getInstance().init(
    new AccountLoader("data/accounts"),
    new TransactionLoader("data/transactions")
  );
  CentralBank.getInstance().init(new MemberEndowmentLoader("data/endowment-profiles"));
  MemberService.getInstance().init(new MemberLoader("data/members"));
  Marketplace.getInstance().init(
    new PostLoader("data/posts")
  );

  // ── Scheduler ────────────────────────────────────────────────────────────────
  const scheduler = new Scheduler("data/scheduler");

  scheduler.register({
    name: "anniversaries",
    intervalMs: every.days(1),
    run: () => MemberService.getInstance().checkAnniversaries(),
  });
  scheduler.register({
    name: "demurrage",
    intervalMs: every.months(1),
    run: () => CentralBank.getInstance().assessDemurrage(0.02),
  });
  scheduler.register({
    name: "payroll",
    intervalMs: every.months(1),
    run: () => PayrollService.getInstance().payMonthly(),
  });

  await scheduler.start();

  // ── Network ──────────────────────────────────────────────────────────────────
  // Must complete before HTTP server starts — /node/* routes require NodeService.
  await NodeService.getInstance().init({
    type:    (process.env.NODE_TYPE ?? "community") as NodeType,
    name:    process.env.NODE_NAME ?? Community.getInstance().name,
    address: process.env.NODE_ADDRESS ?? "http://localhost:3000",
    dataDir: "data/network",
    seeds:   process.env.NODE_SEEDS
                 ? process.env.NODE_SEEDS.split(",").map(s => s.trim()).filter(Boolean)
                 : [],
  });

  // ── HTTP ─────────────────────────────────────────────────────────────────────
  new HttpServer().start();
  console.log("[http] Server initialized");
}

await init();