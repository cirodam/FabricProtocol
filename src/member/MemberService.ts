import { Member } from "./Member.js";
import { MemberLoader } from "./MemberLoader.js";
import { DEFAULT_NUTRITIONAL_PROFILES, getMemberType, NutritionalProfile } from "../domains/food/NutritionalProfile.js";
import { CentralBank } from "../central_bank/CentralBank.js";
import { Commonwealth } from "../commons/Commonwealth.js";
import { Bank } from "../bank/Bank.js";
import { Marketplace } from "../marketplace/Marketplace.js";
import { Constitution } from "../commons/Constitution.js";
import { SocialInsuranceBank } from "../social_insurance/SocialInsuranceBank.js";
import { createHash } from "crypto";

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
    const age = Math.floor((Date.now() - member.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    // Back-debt goes to the retirement pool, not the member's primary account.
    // This prevents a large immediate injection into the money supply.
    SocialInsuranceBank.getInstance().depositContribution(member, age * Constitution.getInstance().kinPerPersonYear);
    this.loader?.save(member);
  }

  get(id: string): Member | undefined {
    return this.members.get(id);
  }

  /** Persist any in-place mutations to an existing member. */
  save(member: Member): void {
    this.loader?.save(member);
  }

  getByPhone(phone: string): Member | undefined {
    return Array.from(this.members.values()).find(m => m.phone === phone);
  }

  getByHandle(handle: string): Member | undefined {
    const normalized = handle.toLowerCase().replace(/[^a-z0-9_]/g, "");
    return Array.from(this.members.values()).find(m => m.handle === normalized);
  }

  getAll(): Member[] {
    return Array.from(this.members.values());
  }

  getDailyNutritionalNeeds(): NutritionalProfile {
    const totals: NutritionalProfile = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, waterL: 0 };
    for (const member of this.members.values()) {
      const profile = DEFAULT_NUTRITIONAL_PROFILES[getMemberType(member.birthDate)];
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

  // Call once per day. On each member's birthday, deposits one person-year
  // of kin into the retirement pool on behalf of this member.
  checkAnniversaries(today: Date = new Date()): void {
    const mm = today.getMonth();
    const dd = today.getDate();
    for (const member of this.members.values()) {
      const isBirthday =
        member.birthDate.getMonth() === mm && member.birthDate.getDate() === dd;
      if (isBirthday) {
        SocialInsuranceBank.getInstance().depositContribution(member, Constitution.getInstance().kinPerPersonYear);
      }
    }
  }

  /**
   * Discharge a member (departure or death).
   * 1. SocialInsuranceBank burns the member's unspent pool entitlement.
   * 2. CentralBank reclaims any legacy endowment balance.
   * 3. Any remaining balance is transferred to the Commons.
   * 4. Member's accounts are closed.
   * 5. Member record is deleted.
   */
  discharge(member: Member): void {
    Marketplace.getInstance().removePostsByPoster(member.getId());
    SocialInsuranceBank.getInstance().settleDeath(member);
    CentralBank.getInstance().reclaimEndowment(member);
    Commonwealth.getInstance().collect(member);

    Bank.getInstance().closeAccounts(member.getId());
    this.loader?.delete(member.getId());
    this.members.delete(member.getId());
  }
}
