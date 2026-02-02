import mongoose from "mongoose";
import Category from "./CategorySchema.modal.js";

const taskSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* Assigned worker */
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* Task title */
    taskTitle: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    /* Task status */
    status: {
      type: String,
      enum: ["accepted", "completed", "inProgress", "pending"],
      default: "pending",
    },
    /* Task description */
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    /* Location (Geo + Address) */
    location: {
      geo: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          validate: {
            validator: function (val) {
              return !val || val.length === 2;
            },
            message: "Geo coordinates must be [longitude, latitude]",
          },
        },
      },
      address: {
        type: String,
        trim: true,
      },
    },

    /* Availability Date */
    availabilityDate: {
      type: Date,
      required: true,
    },

    /* Availability Time Slots (Checkbox Style) */
    availabilityTimeSlots: {
      type: [
        {
          type: String,
          enum: ["8-10", "10-12", "12-2", "2-4", "4-6"],
        },
      ],
      validate: {
        validator: function (val) {
          return val && val.length > 0;
        },
        message: "At least one time slot must be selected",
      },
    },

    /* Contact Number */
    contactNumber: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/,
      message: "Contact number must be a valid 10-digit number",
    },

    /* Alternate Contact Number */
    alternateContactNumber: {
      type: String,
      match: /^[0-9]{10}$/,
      message: "Alternate contact number must be a valid 10-digit number",
    },

    /* Cost with dynamic pricing */
    cost: {
      type: Number,
      required: true,
      min: 0,
    },

    /* Task category */
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    /* Feedback after completion */
    feedback: {
      type: String,
      maxlength: 500,
    },

    /* Task images */
    images: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true },
);


taskSchema.index({ "location.geo": "2dsphere" });

// dynamic price validation
taskSchema.pre("validate", async function (next) {
  if (!this.category || this.cost == null) return next();

  const category = await Category.findById(this.category);

  if (!category) {
    return next(new Error("Invalid category selected"));
  }

  if (this.cost < category.minPrice) {
    return next(
      new Error(`Minimum price for ${category.name} is ${category.minPrice}`),
    );
  }

  next();
});

export const Task = mongoose.model("Task", taskSchema);
