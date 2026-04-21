import { Message } from "./Message.js";
import { MessageLoader } from "./MessageLoader.js";
import { MemberService } from "../member/MemberService.js";

export class MessageService {
  private static instance: MessageService | null = null;
  private loader!: MessageLoader;
  private messages: Map<string, Message> = new Map();

  static getInstance(): MessageService {
    if (!MessageService.instance) MessageService.instance = new MessageService();
    return MessageService.instance;
  }

  init(loader: MessageLoader): void {
    this.loader = loader;
    for (const m of loader.loadAll()) this.messages.set(m.id, m);
  }

  /** Send a direct message to a single member. */
  send(fromId: string, toId: string, subject: string, body: string): Message {
    const msg = new Message(fromId, toId, subject, body);
    this.messages.set(msg.id, msg);
    this.loader.save(msg);
    this.trySmsDelivery(msg);
    return msg;
  }

  /**
   * Broadcast an announcement to all active members.
   * Creates one Message record per recipient so each can be marked read independently.
   */
  broadcast(fromId: string, subject: string, body: string): Message[] {
    const members = MemberService.getInstance().getAll().filter(m => !m.disabled);
    const sent: Message[] = [];
    for (const member of members) {
      if (member.id === fromId) continue; // don't send to self
      const msg = new Message(fromId, member.id, subject, body);
      // Mark all broadcasts as coming from the broadcast channel for UI grouping
      (msg as unknown as Record<string, unknown>)["channel"] = "broadcast";
      this.messages.set(msg.id, msg);
      this.loader.save(msg);
      this.trySmsDelivery(msg);
      sent.push(msg);
    }
    // Also keep one canonical broadcast record for the sent view
    const canonical = new Message(fromId, "broadcast", subject, body);
    this.messages.set(canonical.id, canonical);
    this.loader.save(canonical);
    return sent;
  }

  get(id: string): Message | undefined {
    return this.messages.get(id);
  }

  /** All messages addressed to this member (direct + broadcast channel). */
  getInbox(memberId: string): Message[] {
    return [...this.messages.values()]
      .filter(m => m.toId === memberId)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  /** All messages sent by this member. */
  getSent(memberId: string): Message[] {
    return [...this.messages.values()]
      .filter(m => m.fromId === memberId && m.toId !== memberId)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  /** Canonical broadcast announcements (toId === "broadcast"). */
  getBroadcasts(): Message[] {
    return [...this.messages.values()]
      .filter(m => m.toId === "broadcast")
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  unreadCount(memberId: string): number {
    return this.getInbox(memberId).filter(m => m.readAt === null).length;
  }

  markRead(id: string): boolean {
    const msg = this.messages.get(id);
    if (!msg || msg.readAt !== null) return false;
    msg.readAt = new Date();
    this.loader.save(msg);
    return true;
  }

  delete(id: string): boolean {
    if (!this.messages.has(id)) return false;
    this.messages.delete(id);
    return this.loader.delete(id);
  }

  /**
   * If the recipient has a phone number on file, send an SMS notification.
   * Uses the modem/Twilio outgoing path if available.
   */
  private trySmsDelivery(msg: Message): void {
    try {
      const member = MemberService.getInstance().get(msg.toId);
      if (!member?.phone) return;
      const preview = msg.body.length > 100 ? msg.body.slice(0, 97) + "…" : msg.body;
      const smsBody = `[${msg.subject}] ${preview}`;
      // Outgoing SMS is fire-and-forget; errors are logged but do not fail the send
      console.log(`[messaging] SMS to ${member.phone}: ${smsBody}`);
      // TODO: wire to ModemInterface.send() or TwilioInterface.send() when available
    } catch (err) {
      console.error("[messaging] SMS delivery failed:", err);
    }
  }
}
