import express from "express";
import "dotenv/config";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectDB from "./config/db.js";
import { protect } from "./middleware/authMiddleware.js";
import workerRoutes from "./routes/workerRoutes.js";

const app = express();
connectDB();
app.use(
  cors({
    origin: ["https://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use(protect);
app.use("/api/user", userRoutes);
app.use("/api/worker", workerRoutes);

app.listen(5000, () => {
  console.log("Server running");
});
