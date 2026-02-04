import express from "express";
import multer from "multer";
import { createWork } from "../controller/userController.js";
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/create", upload.array("images",3), createWork);

export default router;
