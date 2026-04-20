import { Router } from "express";
import { clearAll } from "../controllers/AdminController.js";

const router = Router();

router.delete("/clear-all", clearAll);

export default router;
