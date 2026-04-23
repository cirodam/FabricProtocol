import { Router } from "express";
import { listClinics, getClinic, createClinic, deleteClinic, addStaff, removeStaff,
         listDentalClinics, getDentalClinic, createDentalClinic, deleteDentalClinic,
         addDentalStaff, removeDentalStaff,
         listRoles, createRole, removeRole, assignRole, unassignRole } from "../controllers/HealthcareController.js";

const router = Router();

router.get("/clinics",                          listClinics);
router.get("/clinics/:id",                      getClinic);
router.post("/clinics",                         createClinic);
router.delete("/clinics/:id",                   deleteClinic);
router.post("/clinics/:id/staff",               addStaff);
router.delete("/clinics/:id/staff/:memberId",   removeStaff);

router.get("/dental-clinics",                           listDentalClinics);
router.get("/dental-clinics/:id",                       getDentalClinic);
router.post("/dental-clinics",                          createDentalClinic);
router.delete("/dental-clinics/:id",                    deleteDentalClinic);
router.post("/dental-clinics/:id/staff",                addDentalStaff);
router.delete("/dental-clinics/:id/staff/:memberId",    removeDentalStaff);

router.get("/roles",               listRoles);
router.post("/roles",              createRole);
router.delete("/roles/:id",        removeRole);
router.post("/roles/:id/assign",   assignRole);
router.delete("/roles/:id/assign", unassignRole);

export default router;
