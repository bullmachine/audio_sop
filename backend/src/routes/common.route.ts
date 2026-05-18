import express from "express";
import { register, login, refreshToken, logout, verifyToken, getUserPermissions, updateProfile, getCurrentUserProfile } from '../controllers/auth.controller';
import { authLimiter } from "../middleware/rateLimit.middleware";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get("/verify", verifyToken);
router.get("/user-permissions", getUserPermissions);
router.put("/update-profile", authenticate, updateProfile);
router.get("/profile", authenticate, getCurrentUserProfile);

export { router };