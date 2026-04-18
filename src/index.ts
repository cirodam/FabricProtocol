import { Community } from "./Community.js";
import { CentralBank } from "./central_bank/CentralBank.js";
import { MemberService } from "./member/MemberService.js";
import { MemberLoader } from "./member/MemberLoader.js";
import { Member } from "./member/Member.js";
import { Commons } from "./commons/Commons.js";
import { CommunityRole } from "./commons/CommunityRole.js";
import { Bank } from "./bank/Bank.js";
import { AccountLoader } from "./bank/AccountLoader.js";
import { TransactionLoader } from "./bank/TransactionLoader.js";
import { EndowmentProfileLoader } from "./central_bank/EndowmentProfileLoader.js";
import { Marketplace } from "./marketplace/Marketplace.js";
import { PostLoader } from "./marketplace/PostLoader.js";
import { TraderProfileLoader } from "./marketplace/TraderProfileLoader.js";
import { Scheduler, every } from "./scheduler/Scheduler.js";
import { PayrollService } from "./commons/PayrollService.js";
import { HttpServer } from "./http/HttpServer.js";


const community = Community.getInstance();
const bank = CentralBank.getInstance();
const memberService = MemberService.getInstance();
const commons = Commons.getInstance();

Bank.getInstance().init(
  new AccountLoader("data/accounts"),
  new TransactionLoader("data/transactions")
);
CentralBank.getInstance().init(new EndowmentProfileLoader("data/endowment-profiles"));
memberService.init(new MemberLoader("data/members"));
Marketplace.getInstance().init(
  new PostLoader("data/posts"),
  new TraderProfileLoader("data/trader-profiles")
);

commons.addPosition(new CommunityRole("Medical Officer"));

// Seed data — only runs on first boot when no members have been persisted yet.
if (memberService.count() === 0) {
  const seedMembers = [
    new Member("Alice", "Flores", new Date("1985-03-12")),
    new Member("Ben", "Okafor", new Date("1992-07-24")),
    new Member("Carmen", "Liu", new Date("1978-11-05")),
    new Member("David", "Marsh", new Date("2001-01-30")),
    new Member("Elena", "Vasquez", new Date("1969-09-18")),
  ];

  for (const member of seedMembers) {
    memberService.add(member);
    bank.issueEndowment(member, 1000);
  }
}

console.log(`${community.name} bootstrapped`);
console.log(`Currency: ${community.currencyName}`);
console.log(`Members: ${memberService.count()}`);
console.log(`Money in circulation: ${bank.moneyInCirculation}`);

const scheduler = new Scheduler("data/scheduler");

scheduler.register({
  name: "anniversaries",
  intervalMs: every.days(1),
  run: () => memberService.checkAnniversaries(),
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

void scheduler.start();

new HttpServer().start();