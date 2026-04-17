import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendMessage, getMessages } from "../controllers/message.controller.js";

const router = express.Router();

router.post("/messages", protectRoute, sendMessage);
router.get("/messages/:otherUserId", protectRoute, getMessages);

export default router;