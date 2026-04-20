import { Router } from "express";
import { getStatus, setBuyRate, activateBuyOrder, deactivateBuyOrder } from "../controllers/ExternalReserveController.js";

const router = Router();

router.get("/",                     getStatus);
router.post("/buy-rate",            setBuyRate);
router.post("/buy-order/activate",  activateBuyOrder);
router.post("/buy-order/deactivate", deactivateBuyOrder);

export default router;
