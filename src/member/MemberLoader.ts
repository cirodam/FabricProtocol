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
  retired: boolean;
  guardianId: string | null;
  phone: string | null;
  pinHash: string | null;
  passwordHash: string | null;
  languages: LanguageProficiency[];
}

export class MemberLoader {
  private readonly store: FileStore;

  constructor(dataDir: string) {
    this.store = new FileStore(dataDir);
  }

  save(member: Member): void {
    const { pinHash, passwordHash } = member.getCredentialsForPersistence();
    const record: MemberRecord = {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      birthDate: member.birthDate.toISOString(),
      joinDate: member.joinDate.toISOString(),
      handle: member.handle,
      disabled: member.disabled,
      retired: member.retired,
      guardianId: member.guardianId,
      phone: member.phone,
      pinHash,
      passwordHash,
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
    return Member.restore({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      birthDate: new Date(r.birthDate),
      joinDate: new Date(r.joinDate),
      handle: r.handle,
      disabled: r.disabled ?? false,
      retired: r.retired ?? false,
      guardianId: r.guardianId,
      phone: r.phone,
      pinHash: r.pinHash ?? null,
      passwordHash: r.passwordHash ?? null,
      languages: r.languages ?? [],
    });
  }
}
