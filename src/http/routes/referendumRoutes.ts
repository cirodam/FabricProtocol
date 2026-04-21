import { Router } from "express";
import {
  listReferenda,
  getReferendum,
  createReferendum,
  castVote,
  closeReferendum,
  cancelReferendum,
  deleteReferendum,
} from "../controllers/ReferendumController.js";

const router = Router();

router.get(   "/",                  listReferenda);
router.get(   "/:id",               getReferendum);
router.post(  "/",                  createReferendum);
router.post(  "/:id/vote",          castVote);
router.post(  "/:id/close",         closeReferendum);
router.post(  "/:id/cancel",        cancelReferendum);
router.delete("/:id",               deleteReferendum);

export default router;
