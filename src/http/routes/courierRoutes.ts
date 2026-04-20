import { Router } from "express";
import {
    listRequests, getRequest, createRequest, cancelRequest, completeRequest, deleteRequest,
    listCouriers, addCourier,
} from "../controllers/CourierController.js";

const router = Router();

// Requests
router.get("/requests",               listRequests);
router.get("/requests/:id",           getRequest);
router.post("/requests",              createRequest);
router.post("/requests/:id/cancel",   cancelRequest);
router.post("/requests/:id/complete", completeRequest);
router.delete("/requests/:id",        deleteRequest);

// Couriers (staff)
router.get("/couriers",  listCouriers);
router.post("/couriers", addCourier);

export default router;
