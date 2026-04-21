import { FileStore } from "../storage/FileStore.js";
import { Message } from "./Message.js";

interface MessageRecord {
  id: string;
  sentAt: string;
  fromId: string;
  toId: string;
  subject: string;
  body: string;
  readAt: string | null;
}

export class MessageLoader {
  private readonly store: FileStore;

  constructor(dataDir: string) {
    this.store = new FileStore(dataDir);
  }

  save(message: Message): void {
    const record: MessageRecord = {
      id:      message.id,
      sentAt:  message.sentAt.toISOString(),
      fromId:  message.fromId,
      toId:    message.toId,
      subject: message.subject,
      body:    message.body,
      readAt:  message.readAt?.toISOString() ?? null,
    };
    this.store.write(message.id, record);
  }

  loadAll(): Message[] {
    return this.store.readAll<MessageRecord>().map(r => this.fromRecord(r));
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  private fromRecord(r: MessageRecord): Message {
    const msg = new Message(r.fromId, r.toId, r.subject, r.body);
    (msg as unknown as Record<string, unknown>)["id"]     = r.id;
    (msg as unknown as Record<string, unknown>)["sentAt"] = new Date(r.sentAt);
    msg.readAt = r.readAt ? new Date(r.readAt) : null;
    return msg;
  }
}
