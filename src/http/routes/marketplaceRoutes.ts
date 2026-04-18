import { Router } from "express";
import {
    listPosts,
    getPost,
    createPost,
    deletePost,
    fulfillTrade,
} from "../controllers/MarketplaceController.js";

const router = Router();

router.get("/posts",           listPosts);
router.post("/posts",          createPost);
router.post("/posts/fulfill",  fulfillTrade);
router.get("/posts/:id",       getPost);
router.delete("/posts/:id",    deletePost);

export default router;
