import cloudinary from "../config/cloudinary.js";
import Task from "../modal/user/Task.model.js";

// Create a new task
export const createWork = async (req, res) => {
  try {
    const {
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
      location, // { lat, lng }
    } = req.body;

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
      }
    }

    // Create the task
    const task = new Task({
      creatorId: req.user._id, // assuming protect middleware adds req.user
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
