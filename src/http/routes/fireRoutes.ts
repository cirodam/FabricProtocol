import { Router } from "express";
import {
    listCompanies, getCompany, createCompany, deleteCompany,
    addCompanyStaff, removeCompanyStaff,
    listRoles, createRole, removeRole, assignRole, unassignRole,
} from "../controllers/FireController.js";

const router = Router();

router.get("/companies",                            listCompanies);
router.get("/companies/:id",                        getCompany);
router.post("/companies",                           createCompany);
router.delete("/companies/:id",                     deleteCompany);
router.post("/companies/:id/staff",                 addCompanyStaff);
router.delete("/companies/:id/staff/:memberId",     removeCompanyStaff);

router.get("/roles",               listRoles);
router.post("/roles",              createRole);
router.delete("/roles/:id",        removeRole);
router.post("/roles/:id/assign",   assignRole);
router.delete("/roles/:id/assign", unassignRole);

export default router;
