import express from "express";
import { verifyWorker, deleteWorker } from "../controller/workerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply protection to all worker routes
router.use(protect);

router.post("/verify-worker", verifyWorker);
router.delete("/delete/:id", deleteWorker);

export default router;
