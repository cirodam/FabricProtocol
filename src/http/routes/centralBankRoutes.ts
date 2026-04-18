import { Router } from "express";
import { getMoneySupply } from "../controllers/CentralBankController.js";

const router = Router();

router.get("/money-supply", getMoneySupply);

export default router;
