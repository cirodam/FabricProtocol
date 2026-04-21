import { Request, Response } from "express";
import { ReferendumService } from "../../referendum/ReferendumService.js";
import { MemberService } from "../../member/MemberService.js";
import { Referendum, type ReferendumType, type ReferendumVote } from "../../referendum/Referendum.js";

const svc = () => ReferendumService.getInstance();

function toDto(ref: Referendum) {
  const member = MemberService.getInstance().get(ref.createdBy);
  const createdByName = member
    ? `${member.firstName} ${member.lastName}`
    : ref.createdBy;

  return {
    id:            ref.id,
    createdAt:     ref.createdAt.toISOString(),
    createdBy:     ref.createdBy,
    createdByName,
    title:         ref.title,
    question:      ref.question,
    body:          ref.body,
    type:          ref.type,
    options:       ref.options,
    status:        ref.status,
    opensAt:       ref.opensAt.toISOString(),
    closesAt:      ref.closesAt.toISOString(),
    quorumPct:     ref.quorumPct,
    passPct:       ref.passPct,
    voteCount:     ref.voteCount,
    tally:         ref.tally(),
    quorumMet:     ref.quorumMet,
    result:        ref.result,
    closedAt:      ref.closedAt?.toISOString() ?? null,
    // Votes included so front-end can check if current member already voted
    votes:         ref.votes.map((v: ReferendumVote) => ({
      memberId: v.memberId,
      choice:   v.choice,
      castAt:   v.castAt.toISOString(),
    })),
  };
}

export const listReferenda = (_req: Request, res: Response): void => {
  res.json(svc().getAll().map(toDto));
};

export const getReferendum = (req: Request, res: Response): void => {
  const ref = svc().get(req.params.id as string);
  if (!ref) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toDto(ref));
};

export const createReferendum = (req: Request, res: Response): void => {
  const { createdBy, title, question, body, type, options, opensAt, closesAt, quorumPct, passPct } = req.body as {
    createdBy: string;
    title: string;
    question: string;
    body?: string;
    type: ReferendumType;
    options?: string[];
    opensAt: string;
    closesAt: string;
    quorumPct?: number;
    passPct?: number;
  };

  if (!createdBy || !title || !question || !type || !opensAt || !closesAt) {
    res.status(400).json({ error: "createdBy, title, question, type, opensAt, closesAt are required" });
    return;
  }
  if (type === "choice" && (!options || options.length < 2)) {
    res.status(400).json({ error: "choice referenda require at least 2 options" });
    return;
  }

  try {
    const ref = svc().create({
      createdBy,
      title,
      question,
      body:      body ?? "",
      type,
      options:   options ?? [],
      opensAt:   new Date(opensAt),
      closesAt:  new Date(closesAt),
      quorumPct: quorumPct ?? 0,
      passPct:   passPct  ?? 50,
    });
    res.status(201).json(toDto(ref));
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
};

export const castVote = (req: Request, res: Response): void => {
  const { memberId, choice } = req.body as { memberId: string; choice: string };
  if (!memberId || !choice) {
    res.status(400).json({ error: "memberId and choice are required" });
    return;
  }
  try {
    const ref = svc().castVote(req.params.id as string, memberId, choice);
    res.json(toDto(ref));
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
};

export const closeReferendum = (req: Request, res: Response): void => {
  try {
    const ref = svc().close(req.params.id as string);
    res.json(toDto(ref));
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
};

export const cancelReferendum = (req: Request, res: Response): void => {
  try {
    const ref = svc().cancel(req.params.id as string);
    res.json(toDto(ref));
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
};

export const deleteReferendum = (req: Request, res: Response): void => {
  try {
    svc().delete(req.params.id as string);
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
};
