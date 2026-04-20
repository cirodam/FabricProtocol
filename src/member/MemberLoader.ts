import { Member } from "./Member.js";
import { LanguageProficiency } from "./Member.js";
import { FileStore } from "../storage/FileStore.js";

/** Shape of a Member record on disk. All Dates stored as ISO strings. */
interface MemberRecord {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  joinDate: string;
  handle: string;
  disabled: boolean;
  guardianId: string | null;
  phone: string | null;
  pinHash: string | null;
  languages: LanguageProficiency[];
}

export class MemberLoader {
  private readonly store: FileStore;

  constructor(dataDir: string) {
    this.store = new FileStore(dataDir);
  }

  save(member: Member): void {
    const record: MemberRecord = {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      birthDate: member.birthDate.toISOString(),
      joinDate: member.joinDate.toISOString(),
      handle: member.handle,
      disabled: member.disabled,
      guardianId: member.guardianId,
      phone: member.phone,
      pinHash: member.pinHash,
      languages: member.languages,
    };
    this.store.write(member.id, record);
  }

  loadAll(): Member[] {
    return this.store.readAll<MemberRecord>().map(r => this.fromRecord(r));
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  private fromRecord(r: MemberRecord): Member {
    const m = new Member(
      r.firstName,
      r.lastName,
      new Date(r.birthDate),
      r.handle,
      r.disabled ?? false,
    );
    // Restore persisted identity fields — bypass readonly via cast
    (m as unknown as Record<string, unknown>)["id"] = r.id;
    (m as unknown as Record<string, unknown>)["joinDate"] = new Date(r.joinDate);
    m.guardianId = r.guardianId;
    m.phone = r.phone;
    m.pinHash = r.pinHash ?? null;
    m.languages = r.languages ?? [];
    return m;
  }
}
