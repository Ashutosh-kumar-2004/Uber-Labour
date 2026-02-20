import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import "dotenv/config";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectDB from "./config/db.js";
import { protect } from "./middleware/authMiddleware.js";
import workerRoutes from "./routes/workerRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { initSocketServer } from "./services/socket.service.js";

const app = express();
const server = http.createServer(app);

connectDB();

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

/* ── HTTP Routes ─────────────────────────────────── */
app.use("/api/auth", authRoutes);
app.use(protect);
app.use("/api/user", userRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/notifications", notificationRoutes);

/* ── Socket.IO ───────────────────────────────────── */
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

initSocketServer(io);

/* ── Start server ────────────────────────────────── */
server.listen(5000, () => {
  console.log("Server running on port 5000 (HTTP + WebSocket)");
});
