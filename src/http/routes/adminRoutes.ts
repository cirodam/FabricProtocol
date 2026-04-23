import { Router } from "express";
import { clearAll, listDomains, enableDomain, disableDomain, batchUpdateDomains } from "../controllers/AdminController.js";

const router = Router();

router.delete("/clear-all", clearAll);

router.get("/domains",              listDomains);
router.post("/domains/batch",       batchUpdateDomains);
router.post("/domains/:id/enable",  enableDomain);
router.delete("/domains/:id",       disableDomain);

export default router;
