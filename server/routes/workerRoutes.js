import express from "express";
import { verifyWorker, acceptTask, rejectTask, completeTask, setWorkerAvailability } from "../controller/workerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply protection to all worker routes
router.use(protect);

router.post("/verify-worker", verifyWorker);
router.patch("/availability", setWorkerAvailability);
router.post("/tasks/:taskId/accept", acceptTask);
router.post("/tasks/:taskId/reject", rejectTask);
router.post("/tasks/:taskId/complete", completeTask);


export default router;
