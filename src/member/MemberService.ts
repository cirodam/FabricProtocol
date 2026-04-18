import { Member } from "./Member.js";
import { MemberLoader } from "./MemberLoader.js";
import { DEFAULT_NUTRITIONAL_PROFILES, NutritionalProfile } from "../domains/food/NutritionalProfile.js";
import { CentralBank } from "../central_bank/CentralBank.js";
import { Commons } from "../commons/Commons.js";
import { Bank } from "../bank/Bank.js";
import { createHash } from "crypto";

export type ExitReason = "DEPARTURE" | "DEATH";

export class MemberService {
  private static instance: MemberService;

  private members: Map<string, Member> = new Map();
  private loader: MemberLoader | null = null;

  private constructor() {}

  /**
   * Set the persistence layer and load all members from disk.
   * Call once at app startup before any other operations.
   */
  init(loader: MemberLoader): void {
    this.loader = loader;
    for (const member of loader.loadAll()) {
      this.members.set(member.id, member);
    }
  }

  static getInstance(): MemberService {
    if (!MemberService.instance) {
      MemberService.instance = new MemberService();
    }
    return MemberService.instance;
  }

  add(member: Member): void {
    this.members.set(member.id, member);
    Bank.getInstance().openAccount(member, "primary");
    this.loader?.save(member);
  }

  get(id: string): Member | undefined {
    return this.members.get(id);
  }

  getByPhone(phone: string): Member | undefined {
    return Array.from(this.members.values()).find(m => m.phone === phone);
  }

  remove(id: string): boolean {
    this.loader?.delete(id);
    return this.members.delete(id);
  }

  getAll(): Member[] {
    return Array.from(this.members.values());
  }

  getDailyNutritionalNeeds(): NutritionalProfile {
    const totals: NutritionalProfile = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, waterL: 0 };
    for (const member of this.members.values()) {
      const profile = DEFAULT_NUTRITIONAL_PROFILES[member.memberType];
      totals.calories  += profile.calories;
      totals.proteinG  += profile.proteinG;
      totals.carbsG    += profile.carbsG;
      totals.fatG      += profile.fatG;
      totals.fiberG    += profile.fiberG;
      totals.waterL    += profile.waterL;
    }
    return totals;
  }

  count(): number {
    return this.members.size;
  }

  /** Hash and store a PIN for a member. Persists immediately. */
  setPin(memberId: string, pin: string): void {
    const member = this.members.get(memberId);
    if (!member) throw new Error(`Member ${memberId} not found`);
    member.pinHash = createHash("sha256").update(pin).digest("hex");
    this.loader?.save(member);
  }

  /** Returns true if the given plain-text PIN matches the member's stored hash. */
  verifyPin(memberId: string, pin: string): boolean {
    const member = this.members.get(memberId);
    if (!member?.pinHash) return false;
    return member.pinHash === createHash("sha256").update(pin).digest("hex");
  }

  // Call once per day. Increments trustScore by 0.01 (capped at 1.0) on a
  // member's birthday and on the anniversary of their join date.
  checkAnniversaries(today: Date = new Date()): void {
    const mm = today.getMonth();
    const dd = today.getDate();
    for (const member of this.members.values()) {
      const isBirthday =
        member.birthDate.getMonth() === mm && member.birthDate.getDate() === dd;
      const isJoinAnniversary =
        member.joinDate.getMonth() === mm && member.joinDate.getDate() === dd;
      let changed = false;
      if (isBirthday) {
        member.trustScore = Math.min(1.0, Math.round((member.trustScore + 0.01) * 100) / 100);
        changed = true;
      }
      if (isJoinAnniversary) {
        member.trustScore = Math.min(1.0, Math.round((member.trustScore + 0.01) * 100) / 100);
        changed = true;
      }
      if (changed) this.loader?.save(member);
    }
  }

  /**
   * Discharge a member on departure or death.
   * 1. Balance up to the endowment amount → returned to CentralBank
   * 2. Any surplus above the endowment → transferred to Commons
   * 3. Member removed from the active roster
   */
  discharge(member: Member, reason: ExitReason): void {
    const bankInst = Bank.getInstance();
    const centralBank = CentralBank.getInstance();
    const commons = Commons.getInstance();
    const profile = centralBank.getProfile(member.getId());
    const endowment = profile?.endowment ?? 0;

    const memberAccount = bankInst.getPrimaryAccount(member.getId());
    const bankAccount = bankInst.getPrimaryAccount(centralBank.getId());
    const commonsAccount = bankInst.getPrimaryAccount(commons.getId());

    if (memberAccount && memberAccount.credits > 0) {
      const toBank = Math.min(memberAccount.credits, endowment);
      if (toBank > 0 && bankAccount) {
        bankInst.transfer(memberAccount.id, bankAccount.id, "credits", toBank, `endowment reclaim on ${reason.toLowerCase()}`);
      }
      const surplus = memberAccount.credits;
      if (surplus > 0 && commonsAccount) {
        bankInst.transfer(memberAccount.id, commonsAccount.id, "credits", surplus, `exit surplus on ${reason.toLowerCase()}`);
      }
    }

    this.loader?.delete(member.getId());
    this.members.delete(member.getId());
  }
}
