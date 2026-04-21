import { CalendarEvent, type RecurrenceFrequency } from "./CalendarEvent.js";
import { CalendarEventLoader } from "./CalendarEventLoader.js";

export interface OccurrenceDto {
  eventId: string;
  occurrenceId: string;   // eventId + "_" + startAt ISO (unique per occurrence)
  title: string;
  type: string;
  description: string | null;
  location: string | null;
  startAt: string;        // ISO of this specific occurrence
  endAt: string | null;   // startAt + duration, or null
  allDay: boolean;
  isRecurring: boolean;
  createdBy: string;
}

export class CalendarService {
  private static instance: CalendarService | null = null;
  private loader!: CalendarEventLoader;
  private events: Map<string, CalendarEvent> = new Map();

  static getInstance(): CalendarService {
    if (!CalendarService.instance) CalendarService.instance = new CalendarService();
    return CalendarService.instance;
  }

  init(loader: CalendarEventLoader): void {
    this.loader = loader;
    for (const e of loader.loadAll()) this.events.set(e.id, e);
  }

  /**
   * Seed default recurring marketplace days if the calendar has no events yet.
   * Saturday = farmers market day. Wednesday = mid-week exchange day.
   */
  seedDefaults(): void {
    if (this.events.size > 0) return;

    const saturdayStart = this.nextWeekday(6); // 6 = Saturday
    const wednesdayStart = this.nextWeekday(3); // 3 = Wednesday

    // Set a 4-hour window: 9am–1pm for Saturday, 4pm–7pm for Wednesday
    saturdayStart.setHours(9, 0, 0, 0);
    const saturdayEnd = new Date(saturdayStart.getTime() + 4 * 60 * 60 * 1000);

    wednesdayStart.setHours(16, 0, 0, 0);
    const wednesdayEnd = new Date(wednesdayStart.getTime() + 3 * 60 * 60 * 1000);

    const saturday = new CalendarEvent(
      "Saturday Marketplace",
      "marketplace",
      saturdayStart,
      saturdayEnd,
      false,
      "system",
      "Weekly community market day. Bring goods, produce, and services to trade.",
      null,
      { frequency: "weekly", daysOfWeek: [6] },
    );

    const wednesday = new CalendarEvent(
      "Wednesday Exchange",
      "marketplace",
      wednesdayStart,
      wednesdayEnd,
      false,
      "system",
      "Mid-week exchange for labor hours, prepared food, and quick trades.",
      null,
      { frequency: "weekly", daysOfWeek: [3] },
    );

    this.create(saturday);
    this.create(wednesday);
    console.log("[calendar] seeded default marketplace days (Saturday + Wednesday)");
  }

  /** Returns the next occurrence of the given day-of-week (0=Sun…6=Sat), today included. */
  private nextWeekday(dow: number): Date {
    const d = new Date();
    const diff = (dow - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + diff);
    return d;
  }

  create(event: CalendarEvent): void {
    this.events.set(event.id, event);
    this.loader.save(event);
  }

  get(id: string): CalendarEvent | undefined {
    return this.events.get(id);
  }

  getAll(): CalendarEvent[] {
    return [...this.events.values()].sort(
      (a, b) => a.startAt.getTime() - b.startAt.getTime(),
    );
  }

  update(event: CalendarEvent): void {
    this.events.set(event.id, event);
    this.loader.save(event);
  }

  delete(id: string): boolean {
    if (!this.events.has(id)) return false;
    this.events.delete(id);
    return this.loader.delete(id);
  }

  /**
   * Returns all occurrences (one-off events + expanded recurring events) whose
   * startAt falls within [rangeStart, rangeEnd].
   */
  getOccurrences(rangeStart: Date, rangeEnd: Date): OccurrenceDto[] {
    const results: OccurrenceDto[] = [];
    for (const event of this.events.values()) {
      const starts = this.expandOccurrences(event, rangeStart, rangeEnd);
      for (const start of starts) {
        const durationMs = event.endAt
          ? event.endAt.getTime() - event.startAt.getTime()
          : null;
        const end = durationMs !== null
          ? new Date(start.getTime() + durationMs).toISOString()
          : null;
        results.push({
          eventId:     event.id,
          occurrenceId: `${event.id}_${start.toISOString()}`,
          title:       event.title,
          type:        event.type,
          description: event.description,
          location:    event.location,
          startAt:     start.toISOString(),
          endAt:       end,
          allDay:      event.allDay,
          isRecurring: event.recurrence !== null,
          createdBy:   event.createdBy,
        });
      }
    }
    results.sort((a, b) => a.startAt.localeCompare(b.startAt));
    return results;
  }

  private expandOccurrences(event: CalendarEvent, rangeStart: Date, rangeEnd: Date): Date[] {
    if (!event.recurrence) {
      return event.startAt >= rangeStart && event.startAt <= rangeEnd
        ? [event.startAt]
        : [];
    }

    const { frequency, daysOfWeek, until, count } = event.recurrence;
    const untilDate = until ? new Date(until) : null;
    const effectiveEnd = untilDate && untilDate < rangeEnd ? untilDate : rangeEnd;

    const results: Date[] = [];
    let current = new Date(event.startAt);
    let occurrenceCount = 0;

    // For weekly/biweekly with explicit daysOfWeek, advance to the first matching day
    // Otherwise just use startAt's day-of-week
    const activeDays: Set<number> | null =
      (frequency === "weekly" || frequency === "biweekly") && daysOfWeek?.length
        ? new Set(daysOfWeek)
        : null;

    const MAX_OCCURRENCES = 10_000; // safety cap

    while (current <= effectiveEnd && occurrenceCount < MAX_OCCURRENCES) {
      if (count !== undefined && occurrenceCount >= count) break;

      if (current >= rangeStart) {
        results.push(new Date(current));
      }
      occurrenceCount++;

      current = this.advance(current, frequency, activeDays);
    }

    return results;
  }

  private advance(date: Date, frequency: RecurrenceFrequency, activeDays: Set<number> | null): Date {
    const d = new Date(date);
    switch (frequency) {
      case "daily":
        d.setDate(d.getDate() + 1);
        break;
      case "weekly":
        if (activeDays) {
          // Advance day by day until we hit a day in activeDays (not the current day)
          do { d.setDate(d.getDate() + 1); } while (!activeDays.has(d.getDay()));
        } else {
          d.setDate(d.getDate() + 7);
        }
        break;
      case "biweekly":
        d.setDate(d.getDate() + 14);
        break;
      case "monthly":
        d.setMonth(d.getMonth() + 1);
        break;
      case "yearly":
        d.setFullYear(d.getFullYear() + 1);
        break;
    }
    return d;
  }
}
