import { Router } from "express";
import { listMembers, getMember, createMember, updateMember } from "../controllers/MemberController.js";

const router = Router();

router.get("/",        listMembers);
router.get("/:id",     getMember);
router.post("/",       createMember);
router.patch("/:id",   updateMember);

export default router;
