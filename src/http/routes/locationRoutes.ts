import { Router } from "express";
import { listLocations, getLocation, createLocation, updateLocation, deleteLocation } from "../controllers/LocationController.js";

const router = Router();

router.get("/",     listLocations);
router.get("/:id",  getLocation);
router.post("/",    createLocation);
router.patch("/:id", updateLocation);
router.delete("/:id", deleteLocation);

export default router;
