import { Router } from "express";
import { getRequirements, getSettings, updateSettings } from "../controllers/FoodController.js";

const router = Router();

router.get("/requirements", getRequirements);
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

export default router;
