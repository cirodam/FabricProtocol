import { Member } from "./Member.js";
import { MemberType } from "../food/NutritionalProfile.js";
import { FileStore } from "../storage/FileStore.js";

/** Shape of a Member record on disk. All Dates stored as ISO strings. */
interface MemberRecord {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  joinDate: string;
  memberType: MemberType;
  physicalCapacity: number;
  cognitiveCapacity: number;
  trustScore: number;
  guardianId: string | null;
  dependencyCareId: string | null;
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
      memberType: member.memberType,
      physicalCapacity: member.physicalCapacity,
      cognitiveCapacity: member.cognitiveCapacity,
      trustScore: member.trustScore,
      guardianId: member.guardianId,
      dependencyCareId: member.dependencyCareId,
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
      r.memberType,
      r.physicalCapacity,
      r.cognitiveCapacity,
      r.trustScore
    );
    // Restore persisted identity fields — bypass readonly via cast
    (m as unknown as Record<string, unknown>)["id"] = r.id;
    (m as unknown as Record<string, unknown>)["joinDate"] = new Date(r.joinDate);
    m.guardianId = r.guardianId;
    m.dependencyCareId = r.dependencyCareId;
    return m;
  }
}
