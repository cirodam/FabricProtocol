import { TraderProfile } from "./TraderProfile.js";
import { FileStore } from "../storage/FileStore.js";

interface TraderProfileRecord {
  id: string;
  displayName: string;
  handle: string;
  accountId: string;
  registeredAt: string;
}

export class TraderProfileLoader {
  private readonly store: FileStore;

  constructor(dataDir: string) {
    this.store = new FileStore(dataDir);
  }

  save(profile: TraderProfile): void {
    const record: TraderProfileRecord = {
      id: profile.id,
      displayName: profile.displayName,
      handle: profile.handle,
      accountId: profile.accountId,
      registeredAt: profile.registeredAt.toISOString(),
    };
    this.store.write(profile.id, record);
  }

  loadAll(): TraderProfile[] {
    return this.store.readAll<TraderProfileRecord>().map(r => {
      const profile = new TraderProfile(r.displayName, r.handle, r.accountId);
      const p = profile as unknown as Record<string, unknown>;
      p["id"] = r.id;
      p["registeredAt"] = new Date(r.registeredAt);
      return profile;
    });
  }
}
