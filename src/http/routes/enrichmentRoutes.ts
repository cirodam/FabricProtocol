import { Router } from "express";
import { listRoles, createRole, removeRole, assignRole, unassignRole, listUpcomingEvents } from "../controllers/EnrichmentController.js";

const router = Router();

router.get("/roles",               listRoles);
router.post("/roles",              createRole);
router.delete("/roles/:id",        removeRole);
router.post("/roles/:id/assign",   assignRole);
router.delete("/roles/:id/assign", unassignRole);

router.get("/events/upcoming", listUpcomingEvents);

export default router;
