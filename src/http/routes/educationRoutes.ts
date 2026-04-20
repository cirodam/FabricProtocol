import { Router } from "express";
import { listSchools, getSchool, createSchool, deleteSchool,
         addSchoolStaff, removeSchoolStaff,
         listLibraries, getLibrary, createLibrary, deleteLibrary,
         addLibraryStaff, removeLibraryStaff } from "../controllers/EducationController.js";

const router = Router();

router.get("/schools",                          listSchools);
router.get("/schools/:id",                      getSchool);
router.post("/schools",                         createSchool);
router.delete("/schools/:id",                   deleteSchool);
router.post("/schools/:id/staff",               addSchoolStaff);
router.delete("/schools/:id/staff/:memberId",   removeSchoolStaff);

router.get("/libraries",                         listLibraries);
router.get("/libraries/:id",                     getLibrary);
router.post("/libraries",                        createLibrary);
router.delete("/libraries/:id",                  deleteLibrary);
router.post("/libraries/:id/staff",              addLibraryStaff);
router.delete("/libraries/:id/staff/:memberId",  removeLibraryStaff);

export default router;
