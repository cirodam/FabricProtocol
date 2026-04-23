import { Router } from "express";
import {
    getHomeChildcareUnit, addHomeChildcareStaff, removeHomeChildcareStaff,
    listRoles, createRole, removeRole, assignRole, unassignRole,
} from "../controllers/ChildCareController.js";

const router = Router();

router.get("/home-childcare",                       getHomeChildcareUnit);
router.post("/home-childcare/staff",                addHomeChildcareStaff);
router.delete("/home-childcare/staff/:memberId",    removeHomeChildcareStaff);

router.get("/roles",               listRoles);
router.post("/roles",              createRole);
router.delete("/roles/:id",        removeRole);
router.post("/roles/:id/assign",   assignRole);
router.delete("/roles/:id/assign", unassignRole);

export default router;
