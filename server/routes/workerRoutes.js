import express from "express";
import {
  verifyWorker,
  acceptTask,
  rejectTask,
  completeTask,
  setWorkerAvailability,
  getWorkerProfile,
  getAvailableTasks,
  updateWorkerLocation,
} from "../controller/workerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply protection to all worker routes
router.use(protect);

router.get("/profile", getWorkerProfile);
router.post("/verify-worker", verifyWorker);
router.patch("/availability", setWorkerAvailability);
router.get("/tasks/available", getAvailableTasks);
router.post("/tasks/:taskId/accept", acceptTask);
router.post("/tasks/:taskId/reject", rejectTask);
router.post("/tasks/:taskId/complete", completeTask);
router.post("/tasks/:taskId/location", updateWorkerLocation);

export default router;

