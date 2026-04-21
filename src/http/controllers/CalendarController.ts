import { Request, Response } from "express";
import { CalendarService } from "../../calendar/CalendarService.js";
import { CalendarEvent, type CalendarEventType, type RecurrenceRule } from "../../calendar/CalendarEvent.js";

export async function listOccurrences(req: Request, res: Response): Promise<void> {
  const startParam = typeof req.query.start === "string" ? req.query.start : "";
  const endParam   = typeof req.query.end   === "string" ? req.query.end   : "";
  if (!startParam || !endParam) {
    res.status(400).json({ error: "start and end query params required (ISO dates)" });
    return;
  }
  const rangeStart = new Date(startParam);
  const rangeEnd   = new Date(endParam);
  if (isNaN(rangeStart.getTime()) || isNaN(rangeEnd.getTime())) {
    res.status(400).json({ error: "Invalid start or end date" });
    return;
  }
  res.json(CalendarService.getInstance().getOccurrences(rangeStart, rangeEnd));
}

export async function listEvents(_req: Request, res: Response): Promise<void> {
  res.json(CalendarService.getInstance().getAll().map(toDto));
}

export async function getEvent(req: Request, res: Response): Promise<void> {
  const event = CalendarService.getInstance().get(req.params.id as string);
  if (!event) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toDto(event));
}

export async function createEvent(req: Request, res: Response): Promise<void> {
  const {
    title, type, startAt, endAt, allDay, createdBy,
    description, location, recurrence,
  } = req.body as {
    title: string;
    type: CalendarEventType;
    startAt: string;
    endAt?: string | null;
    allDay?: boolean;
    createdBy: string;
    description?: string | null;
    location?: string | null;
    recurrence?: RecurrenceRule | null;
  };

  if (!title || !type || !startAt || !createdBy) {
    res.status(400).json({ error: "title, type, startAt, and createdBy are required" });
    return;
  }

  const event = new CalendarEvent(
    title.trim(),
    type,
    new Date(startAt),
    endAt ? new Date(endAt) : null,
    allDay ?? false,
    createdBy,
    description ?? null,
    location ?? null,
    recurrence ?? null,
  );

  CalendarService.getInstance().create(event);
  res.status(201).json(toDto(event));
}

export async function updateEvent(req: Request, res: Response): Promise<void> {
  const svc = CalendarService.getInstance();
  const event = svc.get(req.params.id as string);
  if (!event) { res.status(404).json({ error: "Not found" }); return; }

  const body = req.body as Partial<{
    title: string;
    type: CalendarEventType;
    startAt: string;
    endAt: string | null;
    allDay: boolean;
    description: string | null;
    location: string | null;
    recurrence: RecurrenceRule | null;
  }>;

  if (body.title      !== undefined) event.title       = body.title.trim();
  if (body.type       !== undefined) event.type        = body.type;
  if (body.startAt    !== undefined) event.startAt     = new Date(body.startAt);
  if (body.endAt      !== undefined) event.endAt       = body.endAt ? new Date(body.endAt) : null;
  if (body.allDay     !== undefined) event.allDay      = body.allDay;
  if (body.description !== undefined) event.description = body.description;
  if (body.location   !== undefined) event.location    = body.location;
  if (body.recurrence !== undefined) event.recurrence  = body.recurrence;

  svc.update(event);
  res.json(toDto(event));
}

export async function deleteEvent(req: Request, res: Response): Promise<void> {
  const deleted = CalendarService.getInstance().delete(req.params.id as string);
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).send();
}

function toDto(event: CalendarEvent) {
  return {
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
}
