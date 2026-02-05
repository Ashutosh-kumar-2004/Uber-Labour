import cloudinary from "../config/cloudinary.js";
import Task from "../modal/user/Task.model.js";


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
      images, // Now expecting array of URLs from body
    } = req.body;

    // Parse location if it's a string
    if (typeof location === "string") {
      location = JSON.parse(location);
    }

    // Validation: ensure location
    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({ message: "Location is required" });
    }

    // Ensure images is an array
    let imageUrls = [];
    if (images) {
      if (Array.isArray(images)) {
        imageUrls = images;
      } else if (typeof images === "string") {
        imageUrls = [images];
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

// Helper function to extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  try {
    // Example: https://res.cloudinary.com/cloud_name/image/upload/v12345/tasks/abcde.jpg
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;

    // parts after 'upload': ['v12345', 'tasks', 'abcde.jpg']
    const pathParts = parts.slice(uploadIndex + 1);

    // Filter out version (starts with 'v' and is numeric-ish, or just starts with v)
    // Cloudinary versions usually start with v
    const relevantParts = pathParts.filter((part) => !part.match(/^v\d+$/));

    // Join remaining parts: "tasks/abcde.jpg"
    const fullPath = relevantParts.join("/");
    
    // Remove extension
    const lastDotIndex = fullPath.lastIndexOf(".");
    if (lastDotIndex === -1) return fullPath;
    return fullPath.substring(0, lastDotIndex);
  } catch (error) {
    console.error("Error parsing public ID:", error);
    return null;
  }
};

export const deleteWork = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check ownership
    if (task.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }

    // Delete images from Cloudinary
    if (task.images && task.images.length > 0) {
      for (const imageUrl of task.images) {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    await task.deleteOne();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
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
