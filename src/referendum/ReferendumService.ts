import { Referendum, type ReferendumType } from "./Referendum.js";
import { ReferendumLoader } from "./ReferendumLoader.js";
import { MemberService } from "../member/MemberService.js";

export class ReferendumService {
  private static instance: ReferendumService;
  private refs: Map<string, Referendum> = new Map();
  private loader: ReferendumLoader | null = null;

  private constructor() {}

  static getInstance(): ReferendumService {
    if (!ReferendumService.instance) {
      ReferendumService.instance = new ReferendumService();
    }
    return ReferendumService.instance;
  }

  init(loader: ReferendumLoader): void {
    this.loader = loader;
    for (const ref of loader.loadAll()) {
      this.autoTransition(ref);
      this.refs.set(ref.id, ref);
    }
  }

  create(params: {
    createdBy: string;
    title: string;
    question: string;
    body: string;
    type: ReferendumType;
    options: string[];
    opensAt: Date;
    closesAt: Date;
    quorumPct?: number;
    passPct?: number;
  }): Referendum {
    const ref = new Referendum(
      params.createdBy,
      params.title,
      params.question,
      params.body,
      params.type,
      params.options,
      params.opensAt,
      params.closesAt,
      params.quorumPct ?? 0,
      params.passPct  ?? 50,
    );
    this.refs.set(ref.id, ref);
    this.loader?.save(ref);
    return ref;
  }

  get(id: string): Referendum | undefined {
    const ref = this.refs.get(id);
    if (ref) this.autoTransition(ref);
    return ref;
  }

  getAll(): Referendum[] {
    const all = [...this.refs.values()];
    all.forEach(r => this.autoTransition(r));
    return all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  castVote(id: string, memberId: string, choice: string): Referendum {
    const ref = this.refs.get(id);
    if (!ref) throw new Error(`Referendum ${id} not found`);
    this.autoTransition(ref);
    ref.castVote(memberId, choice);
    this.loader?.save(ref);
    return ref;
  }

  /** Manually close a referendum and compute the result. */
  close(id: string): Referendum {
    const ref = this.refs.get(id);
    if (!ref) throw new Error(`Referendum ${id} not found`);
    if (ref.status !== "open") throw new Error("Referendum is not open");
    this.computeResult(ref);
    this.loader?.save(ref);
    return ref;
  }

  cancel(id: string): Referendum {
    const ref = this.refs.get(id);
    if (!ref) throw new Error(`Referendum ${id} not found`);
    if (ref.status === "closed") throw new Error("Cannot cancel a closed referendum");
    ref.status   = "cancelled";
    ref.closedAt = new Date();
    this.loader?.save(ref);
    return ref;
  }

  delete(id: string): void {
    const ref = this.refs.get(id);
    if (!ref) throw new Error(`Referendum ${id} not found`);
    if (ref.status === "open") throw new Error("Cannot delete an open referendum");
    this.refs.delete(id);
    this.loader?.delete(id);
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  /** Auto-open a draft whose opensAt has passed; auto-close an open one past closesAt. */
  private autoTransition(ref: Referendum): void {
    const now = new Date();
    if (ref.status === "draft" && now >= ref.opensAt) {
      ref.status = "open";
      this.loader?.save(ref);
    }
    if (ref.status === "open" && now >= ref.closesAt) {
      this.computeResult(ref);
      this.loader?.save(ref);
    }
  }

  private computeResult(ref: Referendum): void {
    ref.status   = "closed";
    ref.closedAt = new Date();

    const activeMemberCount = MemberService.getInstance().count();
    if (ref.quorumPct > 0 && activeMemberCount > 0) {
      ref.quorumMet = ref.voteCount / activeMemberCount >= ref.quorumPct / 100;
    } else {
      ref.quorumMet = true;
    }

    if (!ref.quorumMet) {
      ref.result = null;
      return;
    }

    const tally = ref.tally();
    let maxVotes = -1;
    let winner: string | null = null;
    let tie = false;

    for (const [option, count] of Object.entries(tally)) {
      if (count > maxVotes) {
        maxVotes = count;
        winner   = option;
        tie      = false;
      } else if (count === maxVotes) {
        tie = true;
      }
    }

    // For binary referenda, also check the passPct threshold
    if (ref.type === "binary" && winner === "Yes" && ref.voteCount > 0) {
      const yesFraction = (tally["Yes"] ?? 0) / ref.voteCount;
      if (yesFraction < ref.passPct / 100) winner = "No";
    }

    ref.result = tie ? null : winner;
  }
}
