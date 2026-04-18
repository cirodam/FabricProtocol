import { Router } from "express";
import { getAccounts, getTransactions, createTransfer } from "../controllers/BankController.js";

const router = Router();

// Account routes — keyed by ownerId (member, domain, etc.)
router.get("/accounts/:ownerId",                    getAccounts);
router.get("/accounts/:accountId/transactions",     getTransactions);

// Transfer route
router.post("/transfers",                           createTransfer);

export default router;
