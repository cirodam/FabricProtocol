import { Router } from "express";
import { getRequirements, getSettings,
    listKitchens, getKitchen, createKitchen, deleteKitchen,
    addKitchenStaff, removeKitchenStaff,
    listMills, getMill, createMill, deleteMill,
    addMillStaff, removeMillStaff } from "../controllers/FoodController.js";

const router = Router();

router.get("/requirements",                             getRequirements);
router.get("/settings",                                 getSettings);

router.get("/kitchens",                                 listKitchens);
router.get("/kitchens/:id",                             getKitchen);
router.post("/kitchens",                                createKitchen);
router.delete("/kitchens/:id",                          deleteKitchen);
router.post("/kitchens/:id/staff",                      addKitchenStaff);
router.delete("/kitchens/:id/staff/:memberId",          removeKitchenStaff);

router.get("/mills",                                    listMills);
router.get("/mills/:id",                                getMill);
router.post("/mills",                                   createMill);
router.delete("/mills/:id",                             deleteMill);
router.post("/mills/:id/staff",                         addMillStaff);
router.delete("/mills/:id/staff/:memberId",             removeMillStaff);

export default router;
