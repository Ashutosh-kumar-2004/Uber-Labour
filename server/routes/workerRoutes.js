import express from "express";
import multer from "multer";
import { verifyWorker } from "../controller/workerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Apply protection to all worker routes
router.use(protect);

router.post("/verify-worker", upload.single("file"), verifyWorker);

export default router;
