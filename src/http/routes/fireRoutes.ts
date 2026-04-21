import { Router } from "express";
import {
    listCompanies, getCompany, createCompany, deleteCompany,
    addCompanyStaff, removeCompanyStaff,
} from "../controllers/FireController.js";

const router = Router();

router.get("/companies",                            listCompanies);
router.get("/companies/:id",                        getCompany);
router.post("/companies",                           createCompany);
router.delete("/companies/:id",                     deleteCompany);
router.post("/companies/:id/staff",                 addCompanyStaff);
router.delete("/companies/:id/staff/:memberId",     removeCompanyStaff);

export default router;
