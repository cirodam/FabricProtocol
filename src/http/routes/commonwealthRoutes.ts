import { Router } from "express";
import { getSummary, getDemurrage } from "../controllers/CommonwealthController.js";

const router = Router();

router.get("/summary", getSummary);
router.get("/demurrage", getDemurrage);

export default router;
