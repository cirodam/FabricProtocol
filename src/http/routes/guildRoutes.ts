import { Router } from "express";
import {
    listGuilds, getGuild, createGuild, deleteGuild,
    addMember, removeMember, drawMembers,
} from "../controllers/GuildController.js";

const router = Router();

router.get("/",                             listGuilds);
router.post("/",                            createGuild);
router.get("/:id",                          getGuild);
router.delete("/:id",                       deleteGuild);
router.post("/:id/members",                 addMember);
router.delete("/:id/members/:memberId",     removeMember);
router.post("/:id/draw",                    drawMembers);

export default router;
