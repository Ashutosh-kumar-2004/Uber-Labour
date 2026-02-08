import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    /* Receiver (worker) */
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
      index: true
    },

    /* Related task */
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true
    },

    /* Notification type */
    type: {
      type: String,
      enum: [
        "task_available",   // broadcast
        "task_assigned",    // winner
        "task_unavailable", // losers
        "task_cancelled"
      ],
      required: true
    },

    /* Read state */
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "expired"],
      default: "sent"
    },

    /* Auto-expire (TTL index) */
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
