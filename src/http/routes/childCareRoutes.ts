import { Router } from "express";
import {
    getHomeChildcareUnit, addHomeChildcareStaff, removeHomeChildcareStaff,
} from "../controllers/ChildCareController.js";

const router = Router();

router.get("/home-childcare",                       getHomeChildcareUnit);
router.post("/home-childcare/staff",                addHomeChildcareStaff);
router.delete("/home-childcare/staff/:memberId",    removeHomeChildcareStaff);

export default router;
