import { Router } from "express";
import { getCurrencyBoardStatus } from "../controllers/CurrencyBoardController.js";

const router = Router();

router.get("/", getCurrencyBoardStatus);

export default router;
