import { Router } from "express";
import { getOverview, addOfficer, removeOfficer } from "../controllers/ProvisioningController.js";

const router = Router();

router.get("/",                           getOverview);
router.post("/officers",                  addOfficer);
router.delete("/officers/:memberId",      removeOfficer);

export default router;
