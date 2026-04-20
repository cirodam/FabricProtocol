import { Router } from "express";
import { getSummary, getDemurrage, getOutflows } from "../controllers/CommonwealthController.js";

const router = Router();

router.get("/summary", getSummary);
router.get("/demurrage", getDemurrage);
router.get("/outflows", getOutflows);

export default router;
