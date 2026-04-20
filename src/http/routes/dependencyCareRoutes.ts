import { Router } from "express";
import {
    listHouseholds, getHousehold, createHousehold, deleteHousehold,
    addHouseholdStaff, removeHouseholdStaff,
    listMedicalCareUnits, getMedicalCareUnit, createMedicalCareUnit, deleteMedicalCareUnit,
    addMedicalCareUnitStaff, removeMedicalCareUnitStaff,
    getHomeCaregivingUnit, addHomeCaregivingStaff, removeHomeCaregivingStaff,
} from "../controllers/DependencyCareController.js";

const router = Router();

router.get("/households",                               listHouseholds);
router.get("/households/:id",                           getHousehold);
router.post("/households",                              createHousehold);
router.delete("/households/:id",                        deleteHousehold);
router.post("/households/:id/staff",                    addHouseholdStaff);
router.delete("/households/:id/staff/:memberId",        removeHouseholdStaff);

router.get("/medical-care-units",                           listMedicalCareUnits);
router.get("/medical-care-units/:id",                       getMedicalCareUnit);
router.post("/medical-care-units",                          createMedicalCareUnit);
router.delete("/medical-care-units/:id",                    deleteMedicalCareUnit);
router.post("/medical-care-units/:id/staff",                addMedicalCareUnitStaff);
router.delete("/medical-care-units/:id/staff/:memberId",    removeMedicalCareUnitStaff);

router.get("/home-caregiving",                          getHomeCaregivingUnit);
router.post("/home-caregiving/staff",                   addHomeCaregivingStaff);
router.delete("/home-caregiving/staff/:memberId",       removeHomeCaregivingStaff);

export default router;
