import { Router } from "express";
import { getSetupStatus, setup } from "../controllers/SetupController.js";

const router = Router();

router.get("/", getSetupStatus);
router.post("/", setup);

export default router;
