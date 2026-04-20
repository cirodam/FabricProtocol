import { Router } from "express";
import { listUnits, getUnit, createUnit, deleteUnit, addMember, removeMember } from "../controllers/HousingController.js";

const router = Router();

router.get("/units",                              listUnits);
router.get("/units/:id",                          getUnit);
router.post("/units",                             createUnit);
router.delete("/units/:id",                       deleteUnit);
router.post("/units/:id/members",                 addMember);
router.delete("/units/:id/members/:memberId",     removeMember);

export default router;
