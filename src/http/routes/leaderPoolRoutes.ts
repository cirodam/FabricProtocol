import { Router } from "express";
import {
    listLeaderPools, getLeaderPool, createLeaderPool, deleteLeaderPool,
    addMember, removeMember, drawMembers, drawCouncilSeats, vacateCouncilSeat,
} from "../controllers/LeaderPoolController.js";

const router = Router();

router.get("/",                                     listLeaderPools);
router.post("/",                                    createLeaderPool);
router.get("/:id",                                  getLeaderPool);
router.delete("/:id",                               deleteLeaderPool);
router.post("/:id/members",                         addMember);
router.delete("/:id/members/:memberId",             removeMember);
router.post("/:id/draw",                            drawMembers);
router.post("/:id/council/draw",                    drawCouncilSeats);
router.delete("/:id/council/seats/:memberId",       vacateCouncilSeat);

export default router;
