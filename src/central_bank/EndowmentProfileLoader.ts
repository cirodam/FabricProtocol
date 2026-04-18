import { MemberEndowmentProfile } from "./MemberEndowmentProfile.js";
import { FileStore } from "../storage/FileStore.js";

interface EndowmentProfileRecord {
  memberId: string;
  endowment: number;
  unrecoveredCredits: number;
  departed: boolean;
}

export class EndowmentProfileLoader {
  private readonly store: FileStore;

  constructor(dataDir: string) {
    this.store = new FileStore(dataDir);
  }

  save(profile: MemberEndowmentProfile): void {
    const record: EndowmentProfileRecord = {
      memberId: profile.memberId,
      endowment: profile.endowment,
      unrecoveredCredits: profile.unrecoveredCredits,
      departed: profile.departed,
    };
    this.store.write(profile.memberId, record);
  }

  loadAll(): MemberEndowmentProfile[] {
    return this.store.readAll<EndowmentProfileRecord>().map(r => {
      const profile = new MemberEndowmentProfile(r.memberId);
      profile.endowment = r.endowment;
      profile.unrecoveredCredits = r.unrecoveredCredits;
      profile.departed = r.departed;
      return profile;
    });
  }
}
