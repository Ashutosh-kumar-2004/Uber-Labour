import express from "express";
import { getNotifications, markAllRead, getWorkerNotifications, markAllReadWorker } from "../controller/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// User-scoped
router.get("/", protect, getNotifications);
router.patch("/read-all", protect, markAllRead);

// Worker-scoped
router.get("/worker", protect, getWorkerNotifications);
router.patch("/worker/read-all", protect, markAllReadWorker);

export default router;
