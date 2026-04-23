import { Router } from "express";
import { getConstitution, setCommunityName } from "../controllers/ConstitutionController.js";

const router = Router();

router.get("/", getConstitution);
router.patch("/name", setCommunityName);

export default router;
