import express from "express";
import { getNotifications, markAllRead } from "../controller/notificationController.js";

const router = express.Router();

router.get("/", getNotifications);
router.patch("/read-all", markAllRead);

export default router;
