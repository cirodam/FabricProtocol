import { FileStore } from "../storage/FileStore.js";
import {
  CalendarEvent,
  type CalendarEventType,
  type RecurrenceRule,
} from "./CalendarEvent.js";

interface CalendarEventRecord {
  id: string;
  createdAt: string;
  createdBy: string;
  title: string;
  type: CalendarEventType;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  recurrence: RecurrenceRule | null;
}

export class CalendarEventLoader {
  private readonly store: FileStore;

  constructor(dataDir: string) {
    this.store = new FileStore(dataDir);
  }

  save(event: CalendarEvent): void {
    const record: CalendarEventRecord = {
      id:          event.id,
      createdAt:   event.createdAt.toISOString(),
      createdBy:   event.createdBy,
      title:       event.title,
      type:        event.type,
      description: event.description,
      location:    event.location,
      startAt:     event.startAt.toISOString(),
      endAt:       event.endAt?.toISOString() ?? null,
      allDay:      event.allDay,
      recurrence:  event.recurrence,
    };
    this.store.write(event.id, record);
  }

  loadAll(): CalendarEvent[] {
    return this.store.readAll<CalendarEventRecord>().map(r => this.fromRecord(r));
  }

  load(id: string): CalendarEvent | undefined {
    const r = this.store.read<CalendarEventRecord>(id);
    return r ? this.fromRecord(r) : undefined;
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  private fromRecord(r: CalendarEventRecord): CalendarEvent {
    const event = new CalendarEvent(
      r.title,
      r.type,
      new Date(r.startAt),
      r.endAt ? new Date(r.endAt) : null,
      r.allDay,
      r.createdBy,
      r.description,
      r.location,
      r.recurrence,
    );
    (event as unknown as Record<string, unknown>)["id"]        = r.id;
    (event as unknown as Record<string, unknown>)["createdAt"] = new Date(r.createdAt);
    return event;
  }
}
