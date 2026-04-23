import { Router } from "express";
import { listUnits, getUnit, createUnit, deleteUnit, addRole, removeRole } from "../controllers/UnitController.js";

const router = Router({ mergeParams: true });

router.get("/",                         listUnits);
router.post("/",                        createUnit);
router.get("/:unitId",                  getUnit);
router.delete("/:unitId",               deleteUnit);
router.post("/:unitId/roles",           addRole);
router.delete("/:unitId/roles/:roleId", removeRole);

export default router;
