import { Router } from "express";
import {
    listCouncils, getCouncil,
    setPool, drawSeats, vacateSeat,
} from "../controllers/CouncilController.js";

const router = Router();

router.get("/",                                  listCouncils);
router.get("/:domainId",                          getCouncil);
router.patch("/:domainId/pool",                   setPool);
router.post("/:domainId/draw",                    drawSeats);
router.delete("/:domainId/seats/:memberId",       vacateSeat);

export default router;
