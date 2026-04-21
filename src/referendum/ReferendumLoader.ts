import { FileStore } from "../storage/FileStore.js";
import { Referendum, type ReferendumType, type ReferendumStatus, type ReferendumVote } from "./Referendum.js";

interface ReferendumRecord {
  id:         string;
  createdAt:  string;
  createdBy:  string;
  title:      string;
  question:   string;
  body:       string;
  type:       ReferendumType;
  options:    string[];
  status:     ReferendumStatus;
  opensAt:    string;
  closesAt:   string;
  quorumPct:  number;
  passPct:    number;
  votes:      { memberId: string; choice: string; castAt: string }[];
  quorumMet:  boolean | null;
  result:     string | null;
  closedAt:   string | null;
}

export class ReferendumLoader {
  private readonly store: FileStore;

  constructor(dataDir: string) {
    this.store = new FileStore(dataDir);
  }

  save(referendum: Referendum): void {
    const record: ReferendumRecord = {
      id:        referendum.id,
      createdAt: referendum.createdAt.toISOString(),
      createdBy: referendum.createdBy,
      title:     referendum.title,
      question:  referendum.question,
      body:      referendum.body,
      type:      referendum.type,
      options:   referendum.options,
      status:    referendum.status,
      opensAt:   referendum.opensAt.toISOString(),
      closesAt:  referendum.closesAt.toISOString(),
      quorumPct: referendum.quorumPct,
      passPct:   referendum.passPct,
      votes:     referendum.votes.map(v => ({
        memberId: v.memberId,
        choice:   v.choice,
        castAt:   v.castAt.toISOString(),
      })),
      quorumMet: referendum.quorumMet,
      result:    referendum.result,
      closedAt:  referendum.closedAt?.toISOString() ?? null,
    };
    this.store.write(referendum.id, record);
  }

  loadAll(): Referendum[] {
    return this.store.readAll<ReferendumRecord>().map(r => this.fromRecord(r));
  }

  load(id: string): Referendum | undefined {
    const r = this.store.read<ReferendumRecord>(id);
    return r ? this.fromRecord(r) : undefined;
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  private fromRecord(r: ReferendumRecord): Referendum {
    const ref = new Referendum(
      r.createdBy,
      r.title,
      r.question,
      r.body,
      r.type,
      r.options,
      new Date(r.opensAt),
      new Date(r.closesAt),
      r.quorumPct,
      r.passPct,
    );
    // Restore persisted identity and state
    (ref as unknown as Record<string, unknown>)["id"]        = r.id;
    (ref as unknown as Record<string, unknown>)["createdAt"] = new Date(r.createdAt);
    ref.status    = r.status;
    ref.votes     = r.votes.map((v): ReferendumVote => ({
      memberId: v.memberId,
      choice:   v.choice,
      castAt:   new Date(v.castAt),
    }));
    ref.quorumMet = r.quorumMet;
    ref.result    = r.result;
    ref.closedAt  = r.closedAt ? new Date(r.closedAt) : null;
    return ref;
  }
}
