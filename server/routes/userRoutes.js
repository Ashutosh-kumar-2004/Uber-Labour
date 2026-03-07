import express from "express";
import { createWork, getMyWorks, deleteWork, renewTask, submitReview, getTaskReview, submitReport, getMyReviews } from "../controller/userController.js";
const router = express.Router();

router.post("/create", createWork);
router.delete("/delete/:id", deleteWork);
router.put("/task/:id/renew", renewTask);
router.get("/my-works", getMyWorks);

// Review & Report
router.post("/task/:taskId/review", submitReview);
router.get("/task/:taskId/review", getTaskReview);
router.post("/task/:taskId/report", submitReport);
router.get("/reviews", getMyReviews);   // paginated past reviews

export default router;
