import cloudinary from "../config/cloudinary.js";
import Worker from "../modal/Worker.model.js";
import User from "../modal/User.js";
import Task from "../modal/user/Task.model.js";
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
      status: "verified",
      isOnline: true
    });

    if (!worker) {
      return res.status(403).json({
        success: false,
        message: "Worker not verified or offline"
      });
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
       REVERT TASK STATE
    ========================= */
    task.status = "broadcasting";
    task.assignedWorkerId = null;
    task.rejectedAt = new Date();
    await task.save();

    /* =========================
       MARK WORKER AVAILABLE
    ========================= */
    await Worker.findByIdAndUpdate(worker._id, {
      isOnline: true
    });

    /* =========================
       RE-BROADCAST NOTIFICATIONS
    ========================= */
    await rebroadcastTask({
      task,
      workerFilter: {
        "services.category": task.taskType
      }
    });

    return res.status(200).json({
      success: true,
      message: "Task rejected and re-broadcasted"
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
    worker.isOnline = isOnline;
    worker.lastSeenAt = new Date();
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
