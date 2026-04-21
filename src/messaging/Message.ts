import { randomUUID } from "crypto";

/**
 * toId values:
 *   - a memberId          → direct message to that member
 *   - "broadcast"         → announcement sent to all active members
 *
 * fromId values:
 *   - a memberId          → sent by that member
 *   - "system"            → automated system notification
 */
export class Message {
  readonly id: string;
  readonly sentAt: Date;

  fromId: string;
  toId: string;
  subject: string;
  body: string;
  readAt: Date | null;

  constructor(
    fromId: string,
    toId: string,
    subject: string,
    body: string,
  ) {
    this.id      = randomUUID();
    this.sentAt  = new Date();
    this.fromId  = fromId;
    this.toId    = toId;
    this.subject = subject;
    this.body    = body;
    this.readAt  = null;
  }
}
