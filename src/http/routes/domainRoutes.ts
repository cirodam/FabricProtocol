import { Router } from "express";
import { listDomains, getDomain, setDomainPool } from "../controllers/DomainController.js";

const router = Router();

router.get("/",          listDomains);
router.get("/:id",       getDomain);
router.patch("/:id/pool", setDomainPool);

export default router;
