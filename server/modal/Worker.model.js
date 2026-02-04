import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adharCardNumber: {
      type: String,
      required: [true, "Adhar Card Number is required"],
      trim: true,
    },
    idCardImage: {
      type: String,
      required: [true, "ID Card Image is required"],
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Worker = mongoose.model("Worker", workerSchema);
export default Worker;
