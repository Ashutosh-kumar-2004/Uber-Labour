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

  services: [{
    category: {
      type: String,
      required: true
    },
    subCategories: [String],
    hourlyRate: Number,
    experience: Number  // years
  }],
  
  /* Online status for broadcast */
  isOnline: {
    type: Boolean,
    default: false
  },
  
  /* Location for real-time matching */
  currentLocation: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point"
    },
    coordinates: {
      type: [Number],
      required: true,
      default: [0, 0]
    }
  },
  
  /* Performance metrics */
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  completedTasks: {
    type: Number,
    default: 0
  },
  acceptanceRate: {
    type: Number,
    default: 100  // percentage
  }
}, { timestamps: true });
workerSchema.index({ "currentLocation": "2dsphere" });
workerSchema.index({ isOnline: 1, "services.category": 1 });
const Worker = mongoose.model("Worker", workerSchema);
export default Worker;
