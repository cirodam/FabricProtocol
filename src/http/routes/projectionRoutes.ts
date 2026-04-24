import { Router } from "express";
import { getProjection } from "../controllers/ProjectionController.js";

const router = Router();

router.get("/", getProjection);

export default router;
