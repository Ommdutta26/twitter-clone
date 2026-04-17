import express from "express";
import {
  fetchAllUsersExceptLogged,
  followUser,
  getCurrentUser,
  getSingleUser,
  getUserProfile,
  syncUser,
  updateProfile,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// public route
router.get("/profile/:username", getUserProfile);

// protected routes
router.post("/sync", protectRoute, syncUser);
router.get("/me", protectRoute, getCurrentUser);
router.put("/profile", protectRoute, updateProfile);
router.post("/follow/:targetUserId", protectRoute, followUser);
router.get('/all',protectRoute,fetchAllUsersExceptLogged)
router.get('/single/:id',getSingleUser)

export default router;