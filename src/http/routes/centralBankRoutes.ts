import { Router } from "express";
import { getMoneySupply, getEndowments } from "../controllers/CentralBankController.js";

const router = Router();

router.get("/money-supply", getMoneySupply);
router.get("/endowments",   getEndowments);

export default router;
