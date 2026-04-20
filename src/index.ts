import { Community } from "./Community.js";
import { Commonwealth } from "./commons/Commonwealth.js";
import { CentralBank } from "./central_bank/CentralBank.js";
import { MemberService } from "./member/MemberService.js";
import { MemberLoader } from "./member/MemberLoader.js";
import { Bank } from "./bank/Bank.js";
import { AccountLoader } from "./bank/AccountLoader.js";
import { TransactionLoader } from "./bank/TransactionLoader.js";
import { MemberEndowmentLoader } from "./central_bank/MemberEndowmentLoader.js";
import { Marketplace } from "./marketplace/Marketplace.js";
import { PostLoader } from "./marketplace/PostLoader.js";
import { GroupService } from "./group/GroupService.js";
import { GroupLoader } from "./group/GroupLoader.js";
import { HousingDomain } from "./domains/housing/HousingDomain.js";
import { HousingUnitLoader } from "./domains/housing/HousingUnitLoader.js";
import { FoodDomain } from "./domains/food/FoodDomain.js";
import { FoodDomainLoader } from "./domains/food/FoodDomainLoader.js";
import { CommunityKitchenLoader } from "./domains/food/CommunityKitchenLoader.js";
import { MillLoader } from "./domains/food/MillLoader.js";
import { HealthcareDomain } from "./domains/healthcare/HealthcareDomain.js";
import { ClinicLoader } from "./domains/healthcare/ClinicLoader.js";
import { DentalClinicLoader } from "./domains/healthcare/DentalClinicLoader.js";
import { EducationDomain } from "./domains/education/EducationDomain.js";
import { SchoolLoader } from "./domains/education/SchoolLoader.js";
import { LibraryLoader } from "./domains/education/LibraryLoader.js";
import { Scheduler, every } from "./scheduler/Scheduler.js";
import { HttpServer } from "./http/HttpServer.js";
import { NodeService } from "./network/NodeService.js";
import { type NodeType } from "./network/NodeIdentity.js";


async function init(): Promise<void> {
  // ── Demurrage rates ──────────────────────────────────────────────────────────
  const BANK_DEMURRAGE_RATE    = 0.02; // shrinks money supply (bank recovery)
  const COMMONS_DEMURRAGE_RATE = 0.01; // commons levy (taxation)
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
  GroupService.getInstance().init(new GroupLoader("data/groups"));
  HousingDomain.getInstance().init(new HousingUnitLoader("data/housing"));
  FoodDomain.getInstance().init(new FoodDomainLoader("data/food"));
  FoodDomain.getInstance().initKitchens(new CommunityKitchenLoader("data/food/kitchens"));
  FoodDomain.getInstance().initMills(new MillLoader("data/food/mills"));
  HealthcareDomain.getInstance().init(new ClinicLoader("data/healthcare/clinics"));
  HealthcareDomain.getInstance().initDentalClinics(new DentalClinicLoader("data/healthcare/dental-clinics"));
  EducationDomain.getInstance().initSchools(new SchoolLoader("data/education/schools"));
  EducationDomain.getInstance().initLibraries(new LibraryLoader("data/education/libraries"));

  // ── Register domains with Commonwealth ──────────────────────────────────────
  const commonwealth = Commonwealth.getInstance();
  commonwealth.addDomain(HousingDomain.getInstance());
  commonwealth.addDomain(FoodDomain.getInstance());
  commonwealth.addDomain(HealthcareDomain.getInstance());
  commonwealth.addDomain(EducationDomain.getInstance());

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
    run: () => CentralBank.getInstance().assessDemurrage(BANK_DEMURRAGE_RATE),
  });
  scheduler.register({
    name: "commons-levy",
    intervalMs: every.months(1),
    run: () => Commonwealth.getInstance().assessDemurrage(COMMONS_DEMURRAGE_RATE),
  });
  scheduler.register({
    name: "payroll",
    intervalMs: every.months(1),
    run: () => Commonwealth.getInstance().payMonthly(),
  });
  scheduler.register({
    name: "food-allowance",
    intervalMs: every.months(1),
    run: () => FoodDomain.getInstance().issueMonthlyCredits(),
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