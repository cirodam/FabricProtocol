import { randomUUID } from "crypto";

export type ReferendumType   = "binary" | "choice";
export type ReferendumStatus = "draft" | "open" | "closed" | "cancelled";

export interface ReferendumVote {
  memberId: string;
  choice:   string;   // "Yes" | "No" for binary; option text for choice
  castAt:   Date;
}

export class Referendum {
  readonly id: string;
  readonly createdAt: Date;

  createdBy:  string;        // memberId
  title:      string;
  question:   string;
  body:       string;        // additional context / background
  type:       ReferendumType;
  options:    string[];      // ["Yes","No"] for binary; custom list for choice
  status:     ReferendumStatus;
  opensAt:    Date;
  closesAt:   Date;
  quorumPct:  number;        // 0–100; 0 = no quorum required
  passPct:    number;        // 0–100; default 50 = simple majority
  votes:      ReferendumVote[];
  quorumMet:  boolean | null; // null until closed
  result:     string | null;  // winning option text, or null (tie / quorum not met)
  closedAt:   Date | null;

  constructor(
    createdBy: string,
    title: string,
    question: string,
    body: string,
    type: ReferendumType,
    options: string[],
    opensAt: Date,
    closesAt: Date,
    quorumPct: number,
    passPct: number,
  ) {
    this.id        = randomUUID();
    this.createdAt = new Date();
    this.createdBy = createdBy;
    this.title     = title;
    this.question  = question;
    this.body      = body;
    this.type      = type;
    this.options   = type === "binary" ? ["Yes", "No"] : options;
    this.status    = new Date() >= opensAt ? "open" : "draft";
    this.opensAt   = opensAt;
    this.closesAt  = closesAt;
    this.quorumPct = quorumPct;
    this.passPct   = passPct;
    this.votes     = [];
    this.quorumMet = null;
    this.result    = null;
    this.closedAt  = null;
  }

  castVote(memberId: string, choice: string): void {
    if (this.status !== "open") throw new Error("Referendum is not open for voting");
    if (!this.options.includes(choice)) throw new Error(`Invalid choice "${choice}"`);
    // Replace any prior vote (allow changing while open)
    this.votes = this.votes.filter(v => v.memberId !== memberId);
    this.votes.push({ memberId, choice, castAt: new Date() });
  }

  tally(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const opt of this.options) counts[opt] = 0;
    for (const v of this.votes) counts[v.choice] = (counts[v.choice] ?? 0) + 1;
    return counts;
  }

  get voteCount(): number { return this.votes.length; }
}
