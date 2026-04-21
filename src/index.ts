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
import { LocationRegistry } from "./location/LocationRegistry.js";
import { LocationLoader } from "./location/LocationLoader.js";
import { CourierDomain } from "./domains/courier/CourierDomain.js";
import { DeliveryRequestLoader } from "./domains/courier/DeliveryRequestLoader.js";
import { DependencyCareDomain } from "./domains/dependency_care/DependencyCareDomain.js";
import { SharedHouseholdLoader } from "./domains/dependency_care/SharedHouseholdLoader.js";
import { MedicalCareUnitLoader } from "./domains/dependency_care/MedicalCareUnitLoader.js";
import { HomeCaregivingLoader } from "./domains/dependency_care/HomeCaregivingLoader.js";
import { ChildcareDomain } from "./domains/child_care/ChildcareDomain.js";
import { HomeChildcareLoader } from "./domains/child_care/HomeChildcareLoader.js";
import { FireDomain } from "./domains/fire/FireDomain.js";
import { FireCompanyLoader } from "./domains/fire/FireCompanyLoader.js";
import { ProvisioningDomain } from "./domains/provisioning/ProvisioningDomain.js";
import { ApplicationService } from "./member/ApplicationService.js";
import { MemberApplicationLoader } from "./member/MemberApplicationLoader.js";
import { SortitionService } from "./commons/sortition/SortitionService.js";
import { SortitionPoolLoader } from "./commons/sortition/SortitionPoolLoader.js";
import { CouncilService } from "./commons/council/CouncilService.js";
import { DomainCouncilLoader } from "./commons/council/DomainCouncilLoader.js";
import { AssemblyService } from "./commons/assembly/AssemblyService.js";
import { CitizensAssemblyLoader } from "./commons/assembly/CitizensAssemblyLoader.js";
import { GovernanceService } from "./commons/GovernanceService.js";
import { ConstitutionLoader } from "./commons/ConstitutionLoader.js";
import { Constitution } from "./commons/Constitution.js";
import { CalendarService } from "./calendar/CalendarService.js";
import { CalendarEventLoader } from "./calendar/CalendarEventLoader.js";
import { MessageService } from "./messaging/MessageService.js";
import { MessageLoader } from "./messaging/MessageLoader.js";
import { ReferendumService } from "./referendum/ReferendumService.js";
import { ReferendumLoader } from "./referendum/ReferendumLoader.js";


async function init(): Promise<void> {
  // ── Constitution (must be first — other services read parameters from it) ──
  GovernanceService.getInstance().initConstitution(new ConstitutionLoader("data/constitution"));
  const constitution = Constitution.getInstance();

  // ── Persistence ─────────────────────────────────────────────────────────────
  Bank.getInstance().init(
    new AccountLoader("data/accounts"),
    new TransactionLoader("data/transactions")
  );
  CentralBank.getInstance().init(new MemberEndowmentLoader("data/endowment-profiles"));
  CentralBank.getInstance().demurrageRate = constitution.bankDemurrageRate;
  Commonwealth.getInstance().levyRate = constitution.commonsLevyRate;
  MemberService.getInstance().init(new MemberLoader("data/members"));
  ApplicationService.getInstance().init(new MemberApplicationLoader("data/members/applications"));
  CalendarService.getInstance().init(new CalendarEventLoader("data/calendar"));
  CalendarService.getInstance().seedDefaults();
  MessageService.getInstance().init(new MessageLoader("data/messages"));
  ReferendumService.getInstance().init(new ReferendumLoader("data/referenda"));
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
  LocationRegistry.getInstance().init(new LocationLoader("data/locations"));
  CourierDomain.getInstance().initRequests(new DeliveryRequestLoader("data/courier/requests"));
  DependencyCareDomain.getInstance().initHouseholds(new SharedHouseholdLoader("data/dependency-care/households"));
  DependencyCareDomain.getInstance().initMedicalCareUnits(new MedicalCareUnitLoader("data/dependency-care/medical-care-units"));
  DependencyCareDomain.getInstance().initHomeCaregiving(new HomeCaregivingLoader("data/dependency-care/home-caregiving"));
  ChildcareDomain.getInstance().initHomeChildcare(new HomeChildcareLoader("data/child-care/home-childcare"));
  FireDomain.getInstance().initCompanies(new FireCompanyLoader("data/fire/companies"));
  SortitionService.getInstance().init(new SortitionPoolLoader("data/sortition/pools"));
  CouncilService.getInstance().init(new DomainCouncilLoader("data/councils"));
  AssemblyService.getInstance().init(new CitizensAssemblyLoader("data/assembly"));
  AssemblyService.getInstance().getOrCreate();

  // ── Register domains with Commonwealth ──────────────────────────────────────
  const commonwealth = Commonwealth.getInstance();
  commonwealth.addDomain(HousingDomain.getInstance());
  commonwealth.addDomain(FoodDomain.getInstance());
  commonwealth.addDomain(HealthcareDomain.getInstance());
  commonwealth.addDomain(EducationDomain.getInstance());
  commonwealth.addDomain(CourierDomain.getInstance());
  commonwealth.addDomain(DependencyCareDomain.getInstance());
  commonwealth.addDomain(ProvisioningDomain.getInstance());

  // ── Ensure every active domain has a permanent council ──────────────────────
  const councilSvc = CouncilService.getInstance();
  for (const domain of [
    HousingDomain.getInstance(),
    FoodDomain.getInstance(),
    HealthcareDomain.getInstance(),
    EducationDomain.getInstance(),
    CourierDomain.getInstance(),
    DependencyCareDomain.getInstance(),
    ChildcareDomain.getInstance(),
    FireDomain.getInstance(),
    ProvisioningDomain.getInstance(),
  ]) {
    councilSvc.getOrCreateCouncil(domain.id, domain.name);
  }

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
    run: () => {
      if (CentralBank.getInstance().unrecoveredKin > 0)
        CentralBank.getInstance().assessDemurrage(constitution.bankDemurrageRate);
    },
  });
  scheduler.register({
    name: "commons-levy",
    intervalMs: every.months(1),
    run: () => Commonwealth.getInstance().assessDemurrage(constitution.commonsLevyRate),
  });
  scheduler.register({
    name: "payroll",
    intervalMs: every.months(1),
    run: () => Commonwealth.getInstance().payMonthly(),
  });
  scheduler.register({
    name: "food-allowance",
    intervalMs: every.months(1),
    run: () => FoodDomain.getInstance().issueMonthlyKin(),
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