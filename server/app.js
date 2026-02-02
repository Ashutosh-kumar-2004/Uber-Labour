import express from "express";
import "dotenv/config";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import connectDB from "./config/db.js";

const app = express();
connectDB();
app.use(
  cors({
    origin: ["https://localhost:5173", "http://localhost:5173"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(5000, () => {
  console.log("Server running");
});
