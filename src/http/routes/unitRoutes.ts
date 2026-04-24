import { Router } from "express";
import { listUnits, getUnit, deleteUnit, addRole, removeRole, listTemplates, createUnit } from "../controllers/UnitController.js";

const router = Router({ mergeParams: true });

router.get("/templates",                listTemplates);
router.get("/",                         listUnits);
router.post("/",                        createUnit);
router.get("/:unitId",                  getUnit);
router.delete("/:unitId",               deleteUnit);
router.post("/:unitId/roles",           addRole);
router.delete("/:unitId/roles/:roleId", removeRole);

export default router;
