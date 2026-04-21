import { Router } from "express";
import { getConstitution } from "../controllers/ConstitutionController.js";

const router = Router();

router.get("/", getConstitution);

export default router;
