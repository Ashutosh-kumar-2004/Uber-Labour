import express from "express";
import { login, signup, getMe, logout } from "../controller/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/me", protect, getMe);   // session restore on page reload
router.post("/logout", logout);      // clear httpOnly cookie

export default router;