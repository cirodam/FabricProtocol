import { Router } from "express";
import { listApplications, getApplication, submitApplication, approveApplication, denyApplication } from "../controllers/ApplicationController.js";

const router = Router();

router.get("/",               listApplications);
router.get("/:id",            getApplication);
router.post("/",              submitApplication);
router.post("/:id/approve",   approveApplication);
router.post("/:id/deny",      denyApplication);

export default router;
