import { randomUUID } from "crypto";

export type RecurrenceFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "yearly";

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  /** For weekly/biweekly: which days of the week (0=Sun … 6=Sat). Defaults to startAt's day. */
  daysOfWeek?: number[];
  /** Stop generating occurrences after this ISO date string (inclusive). */
  until?: string;
  /** Stop after this many total occurrences. */
  count?: number;
}

export type CalendarEventType =
  | "general"
  | "marketplace"
  | "meeting"
  | "workshop"
  | "holiday";

export class CalendarEvent {
  readonly id: string;
  readonly createdAt: Date;

  createdBy: string;        // memberId of creator
  title: string;
  type: CalendarEventType;
  description: string | null;
  location: string | null;

  /** For one-off events: the exact start. For recurring: the first occurrence start. */
  startAt: Date;
  /** Null means all-day or open-ended. */
  endAt: Date | null;
  allDay: boolean;

  /** Null means this is a one-off event. */
  recurrence: RecurrenceRule | null;

  constructor(
    title: string,
    type: CalendarEventType,
    startAt: Date,
    endAt: Date | null,
    allDay: boolean,
    createdBy: string,
    description: string | null = null,
    location: string | null = null,
    recurrence: RecurrenceRule | null = null,
  ) {
    this.id          = randomUUID();
    this.createdAt   = new Date();
    this.title       = title;
    this.type        = type;
    this.startAt     = startAt;
    this.endAt       = endAt;
    this.allDay      = allDay;
    this.createdBy   = createdBy;
    this.description = description;
    this.location    = location;
    this.recurrence  = recurrence;
  }
}
