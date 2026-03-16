import express from "express";
import {
  verifyWorker,
  acceptTask,
  rejectTask,
  completeTask,
  setWorkerAvailability,
  getWorkerProfile,
  updateWorkerProfile,
  getAvailableTasks,
  updateWorkerLocation,
  markArrived,
  verifyOTP,
  getWorkerHistory,
  getWorkerPlatformFee,
  getCategories,
  getWorkerReviews,
} from "../controller/workerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply protection to all worker routes
router.use(protect);

router.get("/profile", getWorkerProfile);
router.patch("/profile", updateWorkerProfile);
router.post("/verify-worker", verifyWorker);
router.patch("/availability", setWorkerAvailability);
router.get("/tasks/available", getAvailableTasks);
router.post("/tasks/:taskId/accept", acceptTask);
router.post("/tasks/:taskId/reject", rejectTask);
router.post("/tasks/:taskId/complete", completeTask);
router.post("/tasks/:taskId/location", updateWorkerLocation);
router.post("/tasks/:taskId/arrived", markArrived);    // worker taps "I've Arrived"
router.post("/tasks/:taskId/verify-otp", verifyOTP);   // worker submits OTP from user
router.get("/history", getWorkerHistory);              // worker's completed task history
router.get("/platform-fee", getWorkerPlatformFee);
router.get("/categories", getCategories);               // dynamic categories for registration
router.get("/reviews", getWorkerReviews);              // reviews received by worker

export default router;

