import { Router } from "express";
import {
  listOccurrences,
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/CalendarController.js";

const router = Router();

// GET /api/calendar?start=ISO&end=ISO  — expanded occurrences in range
router.get("/", listOccurrences);

// GET /api/calendar/events             — all event definitions
router.get("/events", listEvents);

// GET /api/calendar/events/:id
router.get("/events/:id", getEvent);

// POST /api/calendar/events
router.post("/events", createEvent);

// PUT /api/calendar/events/:id
router.put("/events/:id", updateEvent);

// DELETE /api/calendar/events/:id
router.delete("/events/:id", deleteEvent);

export default router;
