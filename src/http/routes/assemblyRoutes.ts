import { Router } from "express";
import { getAssembly, drawSeats, vacateSeat } from "../controllers/AssemblyController.js";

const router = Router();

router.get("/",                    getAssembly);
router.post("/draw",               drawSeats);
router.delete("/seats/:memberId",  vacateSeat);

export default router;
