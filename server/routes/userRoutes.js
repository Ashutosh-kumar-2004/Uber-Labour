import express from "express";
import multer from "multer";
import { createWork, getMyWorks } from "../controller/userController.js";
const router = express.Router();

// Configure multer to store files temporarily in 'uploads/' directory
// This ensures 'file.path' is available for Cloudinary upload
const upload = multer({ dest: "uploads/" });

router.post("/create", upload.array("images", 3), createWork);
router.get("/my-works", getMyWorks);

export default router;
