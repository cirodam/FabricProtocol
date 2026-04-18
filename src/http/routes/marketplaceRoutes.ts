import { Router } from "express";
import {
    listPosts,
    getPost,
    createPost,
    deletePost,
    fulfillTrade,
    listTraders,
    getTrader,
    registerTrader,
} from "../controllers/MarketplaceController.js";

const router = Router();

router.get("/posts",           listPosts);
router.post("/posts",          createPost);
router.post("/posts/fulfill",  fulfillTrade);
router.get("/posts/:id",       getPost);
router.delete("/posts/:id",    deletePost);

router.get("/traders",         listTraders);
router.post("/traders",        registerTrader);
router.get("/traders/:id",     getTrader);

export default router;
