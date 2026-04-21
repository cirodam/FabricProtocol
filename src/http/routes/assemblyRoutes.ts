import { Router } from "express";
import { getAssembly, setPool, drawSeats, vacateSeat } from "../controllers/AssemblyController.js";

const router = Router();

router.get("/",                    getAssembly);
router.patch("/pool",              setPool);
router.post("/draw",               drawSeats);
router.delete("/seats/:memberId",  vacateSeat);

export default router;
