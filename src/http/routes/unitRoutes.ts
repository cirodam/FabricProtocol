import { Router } from "express";
import { listUnits, getUnit, deleteUnit, addRole, removeRole } from "../controllers/UnitController.js";

const router = Router({ mergeParams: true });

router.get("/",                         listUnits);
router.get("/:unitId",                  getUnit);
router.delete("/:unitId",               deleteUnit);
router.post("/:unitId/roles",           addRole);
router.delete("/:unitId/roles/:roleId", removeRole);

export default router;
