import { Router } from "express";
import { listRoles, createRole, removeRole, assignRole, unassignRole, listRoutes } from "../controllers/TransportController.js";

const router = Router();

router.get("/roles",               listRoles);
router.post("/roles",              createRole);
router.delete("/roles/:id",        removeRole);
router.post("/roles/:id/assign",   assignRole);
router.delete("/roles/:id/assign", unassignRole);

router.get("/routes", listRoutes);

export default router;
