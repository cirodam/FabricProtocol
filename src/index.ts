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
import { DeathcareDomain } from "./domains/deathcare/DeathcareDomain.js";
import { TransportDomain } from "./domains/transport/TransportDomain.js";
import { EnrichmentDomain } from "./domains/enrichment/EnrichmentDomain.js";
import { ProvisioningDomain } from "./domains/provisioning/ProvisioningDomain.js";
import { ApplicationService } from "./member/ApplicationService.js";
import { MemberApplicationLoader } from "./member/MemberApplicationLoader.js";
import { GuildService } from "./commons/sortition/GuildService.js";
import { GuildLoader } from "./commons/sortition/GuildLoader.js";
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
import { CommunicationsDomain } from "./domains/communications/CommunicationsDomain.js";
import { AgricultureDomain } from "./domains/agriculture/AgricultureDomain.js";
import { SanitationDomain } from "./domains/sanitation/SanitationDomain.js";
import { WaterDomain } from "./domains/water/WaterDomain.js";
import { CommunityRole } from "./commons/CommunityRole.js";
import { SocialInsuranceBank } from "./social_insurance/SocialInsuranceBank.js";
import { SocialInsuranceMemberLoader } from "./social_insurance/SocialInsuranceMemberLoader.js";
import { DataManifest } from "./storage/DataManifest.js";


async function init(): Promise<void> {
  // ── Network + Data Integrity ─────────────────────────────────────────────────
  // NodeService must initialise first so the Ed25519 signing key is available.
  // DataManifest then loads and verifies the integrity manifest before any data
  // files are read — any file modified outside the application will throw here.
  await NodeService.getInstance().init({
    type:    (process.env.NODE_TYPE ?? "community") as NodeType,
    name:    process.env.NODE_NAME ?? Community.getInstance().name,
    address: process.env.NODE_ADDRESS ?? "http://localhost:3000",
    dataDir: "data/network",
    seeds:   process.env.NODE_SEEDS
                 ? process.env.NODE_SEEDS.split(",").map(s => s.trim()).filter(Boolean)
                 : [],
  });
  const signer = NodeService.getInstance().getSigner();
  DataManifest.getInstance().init(
    (data) => signer.signBody(data),
    signer.publicKeyHex
  );

  // ── Constitution (must be before other services — they read parameters from it) ──
  GovernanceService.getInstance().initConstitution(new ConstitutionLoader("data/constitution"));
  const constitution = Constitution.getInstance();

  // ── Persistence ─────────────────────────────────────────────────────────────
  Bank.getInstance().init(
    new AccountLoader("data/accounts"),
    new TransactionLoader("data/transactions")
  );
  CentralBank.getInstance().init(new MemberEndowmentLoader("data/endowment-profiles"));
  CentralBank.getInstance().demurrageRate = constitution.bankDemurrageRate;
  SocialInsuranceBank.getInstance().init(new SocialInsuranceMemberLoader("data/social-insurance"));
  // Restore poolIssued from persisted records so desiredMoneyInCirculation is correct on startup.
  CentralBank.getInstance().restorePoolIssued(SocialInsuranceBank.getInstance().getTotalPoolContributed());
  MemberService.getInstance().init(new MemberLoader("data/members"));
  // Backfill pool contributions for members who predate the social insurance system.
  SocialInsuranceBank.getInstance().backfillMembers(
    MemberService.getInstance().getAll(),
    constitution.kinPerPersonYear,
    constitution.birthdayCirculationFraction,
  );
  // Backfill community endowment for pre-existing members (idempotent via communityEndowmentTotal check).
  {
    const endowment = constitution.communityEndowment;
    if (endowment > 0) {
      for (const member of MemberService.getInstance().getAll()) {
        CentralBank.getInstance().issueCommunityEndowment(
          member,
          Commonwealth.getInstance(),
          endowment,
          constitution.demurrageFloor,
        );
      }
    }
  }
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
  GuildService.getInstance().init(new GuildLoader("data/sortition/pools"));
  CouncilService.getInstance().init(new DomainCouncilLoader("data/councils"));
  CouncilService.getInstance().seedDefaults();
  AssemblyService.getInstance().init(new CitizensAssemblyLoader("data/assembly"));
  AssemblyService.getInstance().getOrCreate();

  // ── Register domains with Commonwealth ──────────────────────────────────────
  const commonwealth = Commonwealth.getInstance();
  const communityOrganizerRole = new CommunityRole("Community Organizer", "Coordinates community events, outreach, and internal communications.", 800);
  CommunicationsDomain.getInstance().addRole(communityOrganizerRole);
  commonwealth.addDomain(CommunicationsDomain.getInstance());
  commonwealth.addDomain(AgricultureDomain.getInstance());
  commonwealth.addDomain(SanitationDomain.getInstance());
  commonwealth.addDomain(WaterDomain.getInstance());
  commonwealth.addDomain(HousingDomain.getInstance());
  commonwealth.addDomain(FoodDomain.getInstance());
  commonwealth.addDomain(HealthcareDomain.getInstance());
  commonwealth.addDomain(EducationDomain.getInstance());
  commonwealth.addDomain(CourierDomain.getInstance());
  commonwealth.addDomain(DependencyCareDomain.getInstance());
  commonwealth.addDomain(ProvisioningDomain.getInstance());
  commonwealth.addDomain(FireDomain.getInstance());
  commonwealth.addDomain(DeathcareDomain.getInstance());
  commonwealth.addDomain(TransportDomain.getInstance());
  commonwealth.addDomain(EnrichmentDomain.getInstance());

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
        CentralBank.getInstance().assessDemurrage(constitution.bankDemurrageRate, constitution.demurrageFloor);
    },
  });
  scheduler.register({
    name: "commons-levy",
    intervalMs: every.months(1),
    run: () => {
      const floor = constitution.demurrageFloor;
      Commonwealth.getInstance().assessDemurrage(
        Commonwealth.getInstance().computedLevyRate(floor, constitution.communityBudget),
        floor,
      );
    },
  });
  scheduler.register({
    name: "retirement-payouts",
    intervalMs: every.months(1),
    run: () => {
      const eligible = MemberService.getInstance().getAll().filter(m => m.retired || m.disabled);
      SocialInsuranceBank.getInstance().issueMonthlyPayments(eligible, constitution.retirementPayoutRate);
    },
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

  // ── HTTP ─────────────────────────────────────────────────────────────────────
  new HttpServer().start();
  console.log("[http] Server initialized");
}

await init();