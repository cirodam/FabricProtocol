import { Router } from "express";
import { getMoneySupply, getEndowments, getDemurrageSchedule } from "../controllers/CentralBankController.js";

const router = Router();

router.get("/money-supply",         getMoneySupply);
router.get("/endowments",           getEndowments);
router.get("/demurrage-schedule",   getDemurrageSchedule);

export default router;
