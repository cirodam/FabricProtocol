import { Router } from "express";
import { listMembers, getMember, createMember, updateMember, deleteMember, getDemographics } from "../controllers/MemberController.js";

const router = Router();

router.get("/demographics", getDemographics);
router.get("/",        listMembers);
router.get("/:id",     getMember);
router.post("/",       createMember);
router.patch("/:id",   updateMember);
router.delete("/:id",  deleteMember);

export default router;
