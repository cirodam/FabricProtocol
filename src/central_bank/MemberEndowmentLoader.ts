import { MemberEndowment } from "./MemberEndowment.js";
import { FileStore } from "../storage/FileStore.js";

interface MemberEndowmentRecord {
  memberId: string;
  endowment: number;
}

export class MemberEndowmentLoader {
  private readonly store: FileStore;

  constructor(dataDir: string) {
    this.store = new FileStore(dataDir);
  }

  save(e: MemberEndowment): void {
    const record: MemberEndowmentRecord = {
      memberId: e.memberId,
      endowment: e.endowment,
    };
    this.store.write(e.memberId, record);
  }

  loadAll(): MemberEndowment[] {
    return this.store.readAll<MemberEndowmentRecord>().map(r => {
      const e = new MemberEndowment(r.memberId);
      e.endowment = r.endowment;
      return e;
    });
  }

  delete(memberId: string): void {
    this.store.delete(memberId);
  }
}

