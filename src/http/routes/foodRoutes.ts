import { Router } from "express";
import { getRequirements, getSettings, updateSettings,
    listKitchens, getKitchen, createKitchen, deleteKitchen,
    addKitchenStaff, removeKitchenStaff,
    listMills, getMill, createMill, deleteMill,
    addMillStaff, removeMillStaff,
    listFoodPurchasing, getFoodPurchasingById, createFoodPurchasing, deleteFoodPurchasing,
    recordPurchase, addFoodPurchasingStaff, removeFoodPurchasingStaff } from "../controllers/FoodController.js";

const router = Router();

router.get("/requirements",                             getRequirements);
router.get("/settings",                                 getSettings);
router.put("/settings",                                 updateSettings);

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

router.get("/purchasing",                               listFoodPurchasing);
router.get("/purchasing/:id",                           getFoodPurchasingById);
router.post("/purchasing",                              createFoodPurchasing);
router.delete("/purchasing/:id",                        deleteFoodPurchasing);
router.post("/purchasing/:id/purchase",                 recordPurchase);
router.post("/purchasing/:id/staff",                    addFoodPurchasingStaff);
router.delete("/purchasing/:id/staff/:memberId",        removeFoodPurchasingStaff);

export default router;
