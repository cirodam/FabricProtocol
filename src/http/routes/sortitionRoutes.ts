import { Router } from "express";
import {
    listPools, getPool, createPool, deletePool,
    addMember, removeMember, drawMembers,
} from "../controllers/SortitionController.js";

const router = Router();

router.get("/pools",                             listPools);
router.post("/pools",                            createPool);
router.get("/pools/:id",                         getPool);
router.delete("/pools/:id",                      deletePool);
router.post("/pools/:id/members",                addMember);
router.delete("/pools/:id/members/:memberId",    removeMember);
router.post("/pools/:id/draw",                   drawMembers);

export default router;
