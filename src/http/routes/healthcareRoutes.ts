import { Router } from "express";
import { listClinics, getClinic, createClinic, deleteClinic, addStaff, removeStaff } from "../controllers/HealthcareController.js";

const router = Router();

router.get("/clinics",                          listClinics);
router.get("/clinics/:id",                      getClinic);
router.post("/clinics",                         createClinic);
router.delete("/clinics/:id",                   deleteClinic);
router.post("/clinics/:id/staff",               addStaff);
router.delete("/clinics/:id/staff/:memberId",   removeStaff);

export default router;
