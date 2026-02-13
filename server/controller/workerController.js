import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import Worker from "../modal/Worker.model.js";
import User from "../modal/User.js";
import Task from "../modal/user/Task.model.js";
import "../modal/TaskRejection.model.js"; // Import model to register schema
import {
  notifyTaskAccepted,
  notifyTaskCancelled,
  rebroadcastTask,
  broadcastTaskAvailable,
  markNotificationRead
} from "../services/notification.service.js";

// Helper function to extract public ID from Cloudinary URL (Reuse this logic)
const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    const pathParts = parts.slice(uploadIndex + 1);
    const relevantParts = pathParts.filter((part) => !part.match(/^v\d+$/));
    const fullPath = relevantParts.join("/");
    const lastDotIndex = fullPath.lastIndexOf(".");
    if (lastDotIndex === -1) return fullPath;
    return fullPath.substring(0, lastDotIndex);
  } catch (error) {
    console.error("Error parsing public ID:", error);
    return null;
  }
};


export const getWorkerProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const worker = await Worker.findOne({ userId });

    if (!worker) {
      return res.status(404).json({ message: "Worker profile not found" });
    }

    const activeTask = await Task.findOne({
      assignedWorkerId: worker._id,
      status: { $in: ["assigned", "inProgress"] }
    });

    res.status(200).json({
      success: true,
      worker,
      activeTask
    });
  } catch (error) {
    console.error("Error fetching worker profile:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const verifyWorker = async (req, res) => {
  try {
    const { adharCardNumber, address, contactNumber, idCardImage } = req.body;
    const userId = req.user._id;

    if (!idCardImage) {
      return res.status(400).json({ message: "ID Card Image URL is required" });
    }

    // Update User with Address and Contact Number
    await User.findByIdAndUpdate(userId, { address, contactNumber });

    // Create or Update Worker Record
    // Check if worker record already exists for this user
    let worker = await Worker.findOne({ userId });

    if (worker) {
      // Delete old image from Cloudinary if it exists
      if (worker.idCardImage) {
        // Use helper to get correct public_id
        const publicId = getPublicIdFromUrl(worker.idCardImage);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      worker.adharCardNumber = adharCardNumber;
      worker.idCardImage = idCardImage;
      worker.status = "pending";
      await worker.save();
    } else {
      worker = new Worker({
        userId,
        adharCardNumber,
        idCardImage,
        status: "pending",
      });
      await worker.save();
    }

    res.status(200).json({
      success: true,
      message: "Worker verification submitted successfully",
      worker,
    });
  } catch (error) {
    console.error("Error in verifyWorker:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const acceptTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    /* =========================
       ROLE CHECK
    ========================= */
    if (req.user.userType !== "worker") {
      return res.status(403).json({
        success: false,
        message: "Only workers can accept tasks"
      });
    }

    /* =========================
       WORKER VALIDATION
    ========================= */
    const worker = await Worker.findOne({
      userId,
      status: "verified"
    });

    if (!worker) {
      return res.status(403).json({
        success: false,
        message: "Worker not verified"
      });
    }

    // 1. Check Ban
    if (worker.banExpiresAt && new Date(worker.banExpiresAt) > new Date()) {
       return res.status(403).json({
         success: false,
         message: `You are banned until ${new Date(worker.banExpiresAt).toLocaleTimeString()}`
       });
    }

    // 2. Check Offline Status
    // If worker is offline, they can ONLY accept if they are "Busy" (have an active task).
    // If they are offline and have NO active task, it means they are manually offline -> Reject.
    if (!worker.isOnline) {
        const activeTask = await Task.findOne({
            assignedWorkerId: worker._id,
            status: { $in: ["assigned", "inProgress"] }
        });

        if (!activeTask) {
             return res.status(403).json({
                success: false,
                message: "You are offline. Go online to accept tasks."
             });
        }
        // If activeTask exists, they are "Busy", allow queueing.
    }

    /* =========================
       FIRST TAP WINS (ATOMIC)
    ========================= */
    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        status: "broadcasting",
        scheduledStartAt: { $gte: new Date() }
      },
      {
        $set: {
          status: "assigned",
          assignedWorkerId: worker._id,
          acceptedAt: new Date()
        }
      },
      { new: true }
    );

    if (!task) {
      return res.status(409).json({
        success: false,
        message: "Task already taken or expired"
      });
    }

    /* =========================
       MARK WORKER BUSY
    ========================= */
    await Worker.findByIdAndUpdate(worker._id, {
      isOnline: false
    });

    /* =========================
       NOTIFICATIONS
    ========================= */
    await notifyTaskAccepted({
      taskId: task._id,
      winnerWorkerId: worker._id
    });

    /* =========================
       RESPONSE
    ========================= */
    return res.status(200).json({
      success: true,
      message: "Task accepted successfully",
      task
    });

  } catch (error) {
    console.error("Accept Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


export const rejectTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    /* =========================
       ROLE CHECK
    ========================= */
    if (req.user.userType !== "worker") {
      return res.status(403).json({
        success: false,
        message: "Only workers can reject tasks"
      });
    }

    /* =========================
       WORKER VALIDATION
    ========================= */
    const worker = await Worker.findOne({ userId });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found"
      });
    }

    /* =========================
       OWNERSHIP + STATE CHECK
    ========================= */
    const task = await Task.findOne({
      _id: taskId,
      assignedWorkerId: worker._id,
      status: "assigned"
    });

    if (!task) {
      return res.status(409).json({
        success: false,
        message: "Task not assigned to this worker"
      });
    }

    /* =========================
       RECORD REJECTION REASON
    ========================= */
    // Dynamic import to avoid circular dependency issues if any, or just standard import
    // Assuming TaskRejection is imported at top. If not, we should have added it.
    // I will use dynamic import here just to be safe or rely on the previous tool call which should have added the import if I did it right.
    // Actually, I can't add import easily with replace_file_content if I don't target the top.
    // I'll assume I can add the model usage here. 
    // Wait, I need to Import TaskRejection.
    
    // I will do a separate replace for the import later or now. 
    // Let's just use mongoose.model("TaskRejection") to avoid import issues if I didn't add the import line.
    const TaskRejection = mongoose.model("TaskRejection");
    
    if (reason) {
        await TaskRejection.create({
            taskId: task._id,
            workerId: worker._id,
            reason: reason
        });
    }

    /* =========================
       REVERT TASK STATE
    ========================= */
    task.status = "broadcasting";
    task.assignedWorkerId = null;
    task.rejectedAt = new Date();
    await task.save();

    /* =========================
       APPLY PENALTY (FINE + BAN)
    ========================= */
    const banDurationHours = 6;
    const fineAmount = 50;
    
    const banExpiresAt = new Date();
    banExpiresAt.setHours(banExpiresAt.getHours() + banDurationHours);

    await Worker.findByIdAndUpdate(worker._id, {
      isOnline: false, // Go offline
      banExpiresAt: banExpiresAt,
      $inc: { outstandingFines: fineAmount }
    });

    /* =========================
       RE-BROADCAST NOTIFICATIONS
    ========================= */
    // Re-broadcasting logic... 
    // We need to import rebroadcastTask if it's not available, but it is in the file.
    await rebroadcastTask({
      task,
      workerFilter: {
        "services.category": task.taskType
      }
    });

    return res.status(200).json({
      success: true,
      message: `Task rejected. You are fined ₹${fineAmount} and banned for ${banDurationHours} hours.`,
      banExpiresAt
    });

  } catch (error) {
    console.error("Reject Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    /* =========================
       ROLE CHECK
    ========================= */
    if (req.user.userType !== "worker") {
      return res.status(403).json({
        success: false,
        message: "Only workers can complete tasks"
      });
    }

    /* =========================
       WORKER VALIDATION
    ========================= */
    const worker = await Worker.findOne({ userId });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found"
      });
    }

    /* =========================
       OWNERSHIP + STATE CHECK
    ========================= */
    const task = await Task.findOne({
      _id: taskId,
      assignedWorkerId: worker._id,
      status: "inProgress"
    });

    if (!task) {
      return res.status(409).json({
        success: false,
        message: "Task not in progress or not assigned to you"
      });
    }

    /* =========================
       COMPLETE TASK
    ========================= */
    task.status = "completed";
    task.completedAt = new Date();
    task.paymentStatus = "released";
    await task.save();

    /* =========================
       UPDATE WORKER METRICS
    ========================= */
    await Worker.findByIdAndUpdate(worker._id, {
      $inc: { completedTasks: 1 },
      isOnline: true
    });

    /* =========================
       NOTIFICATION to USER  ->pending
    ========================= */
    await notifyTaskCompleted({ taskId: task._id });

    return res.status(200).json({
      success: true,
      message: "Task marked as completed",
      task
    });

  } catch (error) {
    console.error("Complete Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const setWorkerAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isOnline } = req.body; // true or false

    /* =========================
       ROLE CHECK
    ========================= */
    if (req.user.userType !== "worker") {
      return res.status(403).json({
        success: false,
        message: "Only workers can update availability"
      });
    }

    /* =========================
       WORKER CHECK
    ========================= */
    const worker = await Worker.findOne({
      userId,
      status: "verified"
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Verified worker profile not found"
      });
    }

    /* =========================
       PREVENT OFFLINE IF ACTIVE TASK
    ========================= */
    if (isOnline === false) {
      const activeTask = await Task.findOne({
        assignedWorkerId: worker._id,
        status: { $in: ["assigned", "inProgress"] }
      });

      if (activeTask) {
        return res.status(409).json({
          success: false,
          message: "Cannot go offline while having an active task"
        });
      }
    }

    /* =========================
       UPDATE AVAILABILITY
    ========================= */
    const { location } = req.body;
    
    worker.isOnline = isOnline;
    worker.lastSeenAt = new Date();

    if (location && location.lat && location.lng) {
      worker.currentLocation = {
        type: "Point",
        coordinates: [location.lng, location.lat]
      };
    } else if (worker.currentLocation && (!worker.currentLocation.coordinates || worker.currentLocation.coordinates.length === 0)) {
       // Fix for GeoJSON error if no new location provided but existing one is invalid
       worker.currentLocation = undefined;
    }

    await worker.save();

    return res.status(200).json({
      success: true,
      message: `Worker is now ${isOnline ? "online" : "offline"}`,
      isOnline: worker.isOnline
    });

  } catch (error) {
    console.error("Set Availability Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const getAvailableTasks = async (req, res) => {
  try {
    const { lat, lng, distance = 10, category } = req.query; // distance in km

    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: "Location (lat, lng) is required to find nearby tasks" 
      });
    }

    const radiusInRadians = distance / 6378.1; // Earth's radius in km

    // Note: Ideally we check for worker ban here too if we want to hide tasks completely
    // But usually we filter at the "accept" stage or let them see but not touch.
    // However, if the user requested "show me the next nearby task still", we might let them see.
    // But to be consistent with "banned", let's assume they shouldn't see tasks if banned? 
    // Actually, usually you can see but not accept. 
    // Let's stick to simple geo query for now, but maybe the UI handles the "Banned" view.
    // The requirement was "show me the next nearby task still" (in previous context).
    // So we don't strictly block fetching here, but we blocked acceptance. 
    
    // WAIT, if the worker is "Offline" due to ban (we set isOnline: false), then 
    // getAvailableTasks is often called only if online. 
    // But our frontend fetches if (isOnline || activeTask). 
    // If banned, isOnline is false. ActiveTask is null (since they rejected).
    // So frontend won't fetch. 
    // We should allow fetching? No, if banned, you are punished.
    
    // Let's leave this as is.

    const query = {
      status: "broadcasting",
      location: {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInRadians]
        }
      }
    };

    if (category && category !== "All") {
      query.taskType = category;
    }

    const tasks = await Task.find(query)
      .populate("userId", "name avatar rating") // Populate creator details if needed
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });

  } catch (error) {
    console.error("Get Available Tasks Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
