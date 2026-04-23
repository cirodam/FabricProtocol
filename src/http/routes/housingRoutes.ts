import { Router } from "express";
import { listUnits, getUnit, createUnit, deleteUnit, addMember, removeMember, getUnhoused, listRoles, createRole, removeRole, assignRole, unassignRole } from "../controllers/HousingController.js";

const router = Router();

router.get("/unhoused",                           getUnhoused);
router.get("/units",                              listUnits);
router.get("/units/:id",                          getUnit);
router.post("/units",                             createUnit);
router.delete("/units/:id",                       deleteUnit);
router.post("/units/:id/members",                 addMember);
router.delete("/units/:id/members/:memberId",     removeMember);

router.get("/roles",              listRoles);
router.post("/roles",             createRole);
router.delete("/roles/:id",       removeRole);
router.post("/roles/:id/assign",  assignRole);
router.delete("/roles/:id/assign", unassignRole);

export default router;
