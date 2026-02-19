import cloudinary from "../config/cloudinary.js";
import Task from "../modal/user/Task.model.js";
import User from "../modal/User.js";

/** Statuses that mean a worker is actively assigned — cancelling costs a fine */
const ACTIVE_STATUSES = new Set(["assigned", "inProgress", "arrived"]);

const CANCELLATION_FINE = 100;     // ₹100
const CANCELLATION_BAN_MS = 60 * 60 * 1000; // 60 minutes

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

    // Construct scheduledStartAt from availabilityDate and first time slot
    // Use local noon as safe default to avoid midnight-UTC timezone issues
    let scheduledDate = new Date(availabilityDate + "T09:00:00"); // default 9 AM local
    if (availabilityTimeSlots && availabilityTimeSlots.length > 0) {
      const startHour = parseInt(availabilityTimeSlots[0].split("-")[0], 10);
      scheduledDate = new Date(availabilityDate + `T${String(startHour).padStart(2, "0")}:00:00`);
    }

    const now = new Date();
    // expiresAt is always 3 days from CREATION TIME (now), not from scheduledDate
    // This prevents tasks with past/midnight scheduledDate from immediately expiring
    const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Create the task
    const task = new Task({
      userId: req.user._id,
      title: taskTitle,
      description,
      taskType: category,
      subcategory,
      price: cost,
      scheduledStartAt: scheduledDate,
      expiresAt,                         // ← 3 days from now (creation time)
      availabilityTimeSlots,
      contactNumber,
      alternateContactNumber,
      address,
      images: imageUrls,
      location: {
        type: "Point",
        coordinates: [parseFloat(location.lng), parseFloat(location.lat)],
      },
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

    // Ownership check
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }

    /* ==========================================================
       PENALTY: task is actively assigned to a worker
       → ₹100 fine + 60-min ban instead of hard delete
    ========================================================== */
    if (ACTIVE_STATUSES.has(task.status)) {
      const banExpiresAt = new Date(Date.now() + CANCELLATION_BAN_MS);

      // Apply fine & ban in one atomic update
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          $inc: { walletBalance: -CANCELLATION_FINE }, // deduct ₹100
          $set: { banExpiresAt },
        },
        { new: true }
      );

      // Cancel the task (keep it in DB for records, mark cancelled)
      await Task.findByIdAndUpdate(id, {
        status: "cancelled",
        $unset: { assignedWorkerId: 1 },
      });

      return res.status(200).json({
        success: true,
        penalised: true,
        message: `Task cancelled. A ₹${CANCELLATION_FINE} fine has been applied and you are banned for 60 minutes.`,
        banExpiresAt,
        walletBalance: updatedUser.walletBalance,
      });
    }

    /* ==========================================================
       NORMAL DELETE: task has no active worker
    ========================================================== */
    // Remove images from Cloudinary
    if (task.images && task.images.length > 0) {
      for (const imageUrl of task.images) {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
    }

    await task.deleteOne();
    return res.status(200).json({ success: true, penalised: false, message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all works created by the logged-in user
export const getMyWorks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
// Renew an expired or cancelled task
export const renewTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check ownership
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to renew this task" });
    }

    // Only allow renewal if status is expired, cancelled, or broadcasting (to bump it up)
    // Actually, user might want to renew a broadcasting task to bring it to top?
    // But mainly for expired/cancelled.
    
    // Update scheduledStartAt to user provided date OR now
    // Expect `newScheduledDate` in body, else default to NOW
    const { newScheduledDate } = req.body;
    const startDate = newScheduledDate ? new Date(newScheduledDate) : new Date();

    if (isNaN(startDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
    }

    task.scheduledStartAt = startDate;
    task.expiresAt = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000); // +3 days
    
    task.status = "broadcasting";
    task.assignedWorkerId = null; // Clear assignment if any
    task.acceptedAt = null;
    task.rejectedAt = null;
    
    await task.save();

    res.status(200).json({ 
        success: true, 
        message: "Task renewed successfully",
        task 
    });
  } catch (error) {
    console.error("Renew Task Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
