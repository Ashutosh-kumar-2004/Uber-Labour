import express from "express";
import { createWork, getMyWorks, deleteWork, renewTask } from "../controller/userController.js";
const router = express.Router();

router.post("/create", createWork);
router.delete("/delete/:id", deleteWork);
router.put("/task/:id/renew", renewTask);
router.get("/my-works", getMyWorks);

export default router;
