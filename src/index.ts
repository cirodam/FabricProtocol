import { Community } from "./Community.js";
import { CentralBank } from "./central_bank/CentralBank.js";
import { MemberService } from "./member/MemberService.js";
import { Member } from "./member/Member.js";
import { Commons } from "./commons/Commons.js";
import { CommunityRole } from "./commons/CommunityRole.js";


const community = Community.getInstance();
const bank = CentralBank.getInstance();
const memberService = MemberService.getInstance();
const commons = Commons.getInstance();

commons.addPosition(new CommunityRole("Medical Officer"));

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

console.log(`${community.name} bootstrapped`);
console.log(`Currency: ${community.currencyName}`);
console.log(`Members: ${memberService.count()}`);
console.log(`Money in circulation: ${bank.moneyInCirculation}`);