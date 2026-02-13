import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    /* =======================
       USER (JOB CREATOR)
    ======================= */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    /* =======================
       WORKER (ACCEPTOR)
    ======================= */
    assignedWorkerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      default: null,
      index: true
    },

    /* =======================
       TASK DETAILS
    ======================= */
    title: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    taskType: {
      type: String, // plumber, electrician, delivery, etc.
      required: true,
      index: true
    },

    /* =======================
       ADDITIONAL INFO
    ======================= */
    images: {
      type: [String],
      default: []
    },

    contactNumber: {
      type: String
    },

    alternateContactNumber: {
      type: String
    },
    
    subcategory: {
        type: String
    },

    address: {
        type: String, // Human readable address
    },

    /* =======================
       SCHEDULING
    ======================= */
    scheduledStartAt: {
      type: Date,
      required: true,
      index: true
    },
    
    // Store original preference if needed
    availabilityTimeSlots: {
        type: [String] 
    },

    estimatedDurationMinutes: {
      type: Number
    },

    /* =======================
       LOCATION (READY FOR GEO)
    ======================= */
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },

    /* =======================
       STATUS MACHINE
    ======================= */
    status: {
      type: String,
      enum: [
        "broadcasting", // visible to workers
        "assigned",     // first worker accepted
        "inProgress",   // task started
        "completed",
        "expired",      // not accepted before start
        "cancelled"
      ],
      default: "broadcasting",
      index: true
    },

    /* =======================
       ACCEPTANCE RACE CONTROL
    ======================= */
    acceptedAt: {
      type: Date,
      default: null
    },

    rejectedAt: {
      type: Date,
      default: null
    },

    /* =======================
       PRICE / PAYMENT
    ======================= */
    price: {
      type: Number,
      required: true
    },

    currency: {
      type: String,
      default: "INR"
    },

    /* =======================
       AUDIT
    ======================= */
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

/* =======================
   INDEXES
======================= */

// Geo queries (nearby workers)
taskSchema.index({ location: "2dsphere" });

// Fast broadcast lookups
taskSchema.index({
  status: 1,
  taskType: 1,
  scheduledStartAt: 1
});

export default mongoose.model("Task", taskSchema);
