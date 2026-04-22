import { Router } from "express";
import { login, logout, me, createAccount } from "../controllers/AuthController.js";

const router = Router();

router.post("/create-account", createAccount);
router.post("/login",  login);
router.post("/logout", logout);
router.get("/me",      me);

export default router;
