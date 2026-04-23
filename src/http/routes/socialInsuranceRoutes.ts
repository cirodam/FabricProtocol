import { Router } from "express";
import { getSocialInsuranceSummary } from "../controllers/SocialInsuranceController.js";

const router = Router();

router.get("/summary", getSocialInsuranceSummary);

export default router;
