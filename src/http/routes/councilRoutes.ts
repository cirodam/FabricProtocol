import { Router } from "express";
import {
    listCouncils, getCouncil, createCouncil, updateCouncil, deleteCouncil,
    setPool, drawSeats, vacateSeat,
} from "../controllers/CouncilController.js";

const router = Router();

router.get(    "/",                        listCouncils);
router.post(   "/",                        createCouncil);
router.get(    "/:id",                     getCouncil);
router.patch(  "/:id",                     updateCouncil);
router.delete( "/:id",                     deleteCouncil);
router.patch(  "/:id/pool",                setPool);
router.post(   "/:id/draw",                drawSeats);
router.delete( "/:id/seats/:memberId",     vacateSeat);

export default router;
