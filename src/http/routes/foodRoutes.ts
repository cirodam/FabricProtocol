import { Router } from "express";
import { getRequirements } from "../controllers/FoodController.js";

const router = Router();

router.get("/requirements", getRequirements);

export default router;
