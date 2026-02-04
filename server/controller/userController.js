import cloudinary from "../config/cloudinary.js";
import Task from "../modal/user/Task.model.js";
import fs from "fs";

// Create a new task
export const createWork = async (req, res) => {
  try {
    let {
      taskTitle,
      description,
      category,
      subcategory,
      cost,
      availabilityDate,
      availabilityTimeSlots,
      contactNumber,
      alternateContactNumber,
      address,
      location, // { lat, lng } or JSON string
    } = req.body;

    // Parse location if it's a string (from FormData)
    if (typeof location === "string") {
      location = JSON.parse(location);
    }

    // Validation: ensure location
    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({ message: "Location is required" });
    }

    // Handle Cloudinary uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "tasks",
        });
        imageUrls.push(result.secure_url);
        // Clean up temp file
        fs.unlinkSync(file.path);
      }
    }

    // Create the task
    const task = new Task({
      creatorId: req.user._id, 
      taskTitle,
      description,
      category,
      cost,
      availabilityDate,
      availabilityTimeSlots,
      contactNumber,
      alternateContactNumber,
      location: {
        geo: {
          type: "Point",
          coordinates: [parseFloat(location.lng), parseFloat(location.lat)],
        },
        address,
      },
      images: imageUrls,
    });

    await task.save();

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Get all works created by the logged-in user
export const getMyWorks = async (req, res) => {
  try {
    const tasks = await Task.find({ creatorId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
