import { Router } from "express";
import { listUnits, getUnit, createUnit, deleteUnit } from "../controllers/HousingController.js";

const router = Router();

router.get("/units",     listUnits);
router.get("/units/:id", getUnit);
router.post("/units",    createUnit);
router.delete("/units/:id", deleteUnit);

export default router;
