import express from "express";
import { createWork, getMyWorks, deleteWork } from "../controller/userController.js";
const router = express.Router();

router.post("/create", createWork);
router.delete("/delete/:id", deleteWork);
router.get("/my-works", getMyWorks);

export default router;
