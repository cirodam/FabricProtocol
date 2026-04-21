import { Request, Response } from "express";
import { MessageService } from "../../messaging/MessageService.js";
import { MemberService } from "../../member/MemberService.js";
import { Message } from "../../messaging/Message.js";

function toDto(msg: Message) {
  const svc = MemberService.getInstance();
  const fromMember = msg.fromId === "system" ? null : svc.get(msg.fromId);
  const toMember   = msg.toId === "broadcast" ? null : svc.get(msg.toId);
  return {
    id:           msg.id,
    sentAt:       msg.sentAt.toISOString(),
    fromId:       msg.fromId,
    fromName:     fromMember ? `${fromMember.firstName} ${fromMember.lastName}` : msg.fromId,
    fromHandle:   fromMember?.handle ?? null,
    toId:         msg.toId,
    toName:       toMember ? `${toMember.firstName} ${toMember.lastName}` : msg.toId,
    subject:      msg.subject,
    body:         msg.body,
    readAt:       msg.readAt?.toISOString() ?? null,
  };
}

export async function getInbox(req: Request, res: Response): Promise<void> {
  const memberId = typeof req.query.memberId === "string" ? req.query.memberId : "";
  if (!memberId) { res.status(400).json({ error: "memberId required" }); return; }
  res.json(MessageService.getInstance().getInbox(memberId).map(toDto));
}

export async function getSent(req: Request, res: Response): Promise<void> {
  const memberId = typeof req.query.memberId === "string" ? req.query.memberId : "";
  if (!memberId) { res.status(400).json({ error: "memberId required" }); return; }
  res.json(MessageService.getInstance().getSent(memberId).map(toDto));
}

export async function getBroadcasts(_req: Request, res: Response): Promise<void> {
  res.json(MessageService.getInstance().getBroadcasts().map(toDto));
}

export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  const memberId = typeof req.query.memberId === "string" ? req.query.memberId : "";
  if (!memberId) { res.status(400).json({ error: "memberId required" }); return; }
  res.json({ count: MessageService.getInstance().unreadCount(memberId) });
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const { fromId, toId, subject, body } = req.body as {
    fromId: string;
    toId: string;
    subject: string;
    body: string;
  };
  if (!fromId || !toId || !subject || !body) {
    res.status(400).json({ error: "fromId, toId, subject, and body are required" });
    return;
  }
  const msg = MessageService.getInstance().send(fromId, toId, subject.trim(), body.trim());
  res.status(201).json(toDto(msg));
}

export async function sendBroadcast(req: Request, res: Response): Promise<void> {
  const { fromId, subject, body } = req.body as {
    fromId: string;
    subject: string;
    body: string;
  };
  if (!fromId || !subject || !body) {
    res.status(400).json({ error: "fromId, subject, and body are required" });
    return;
  }
  const sent = MessageService.getInstance().broadcast(fromId, subject.trim(), body.trim());
  res.status(201).json({ count: sent.length });
}

export async function markRead(req: Request, res: Response): Promise<void> {
  const ok = MessageService.getInstance().markRead(req.params.id as string);
  if (!ok) { res.status(404).json({ error: "Not found or already read" }); return; }
  res.status(204).send();
}

export async function deleteMessage(req: Request, res: Response): Promise<void> {
  const ok = MessageService.getInstance().delete(req.params.id as string);
  if (!ok) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).send();
}
