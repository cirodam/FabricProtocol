import { Router } from "express";
import {
  getInbox,
  getSent,
  getBroadcasts,
  getUnreadCount,
  sendMessage,
  sendBroadcast,
  markRead,
  deleteMessage,
} from "../controllers/MessageController.js";

const router = Router();

// GET /api/messages/inbox?memberId=
router.get("/inbox", getInbox);

// GET /api/messages/sent?memberId=
router.get("/sent", getSent);

// GET /api/messages/broadcasts
router.get("/broadcasts", getBroadcasts);

// GET /api/messages/unread-count?memberId=
router.get("/unread-count", getUnreadCount);

// POST /api/messages          — direct message
router.post("/", sendMessage);

// POST /api/messages/broadcast — announcement to all members
router.post("/broadcast", sendBroadcast);

// POST /api/messages/:id/read
router.post("/:id/read", markRead);

// DELETE /api/messages/:id
router.delete("/:id", deleteMessage);

export default router;
