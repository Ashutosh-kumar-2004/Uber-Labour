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
      status: { $in: ["assigned", "arrived", "inProgress"] }
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

    // Update User with Address, Contact Number AND upgrade to worker role
    await User.findByIdAndUpdate(userId, { 
      address, 
      contactNumber,
      userType: "worker" 
    });

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

// export const acceptTask = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const userId = req.user.id;

//     /* =========================
//        WORKER VALIDATION
//     ========================= */
//     const worker = await Worker.findOne({
//       userId,
//       status: "verified"
//     });

//     if (!worker) {
//       return res.status(403).json({
//         success: false,
//         message: "Worker not verified"
//       });
//     }

//     // 1. Check Ban
//     if (worker.banExpiresAt && new Date(worker.banExpiresAt) > new Date()) {
//        return res.status(403).json({
//          success: false,
//          message: `You are banned until ${new Date(worker.banExpiresAt).toLocaleTimeString()}`
//        });
//     }

//     // 2. Check Offline Status
//     // If worker is offline, they can ONLY accept if they are "Busy" (have an active task).
//     // If they are offline and have NO active task, it means they are manually offline -> Reject.
//     if (!worker.isOnline) {
//         const activeTask = await Task.findOne({
//             assignedWorkerId: worker._id,
//             status: { $in: ["assigned", "arrived", "inProgress"] }
//         });

//         if (!activeTask) {
//              return res.status(403).json({
//                 success: false,
//                 message: "You are offline. Go online to accept tasks."
//              });
//         }
//         // If activeTask exists, they are "Busy", allow queueing.
//     }

//     /* =========================
//        FIRST TAP WINS (ATOMIC)
//     ========================= */
//     const task = await Task.findOneAndUpdate(
//       {
//         _id: taskId,
//         status: "broadcasting",
//         scheduledStartAt: { $gte: new Date() }
//       },
//       {
//         $set: {
//           status: "assigned",
//           assignedWorkerId: worker._id,
//           acceptedAt: new Date()
//         }
//       },
//       { new: true }
//     );

//     if (!task) {
//       return res.status(409).json({
//         success: false,
//         message: "Task already taken or expired"
//       });
//     }

//     /* =========================
//        MARK WORKER BUSY
//     ========================= */
//     await Worker.findByIdAndUpdate(worker._id, {
//       isOnline: false
//     });

//     /* =========================
//        NOTIFICATIONS
//     ========================= */
//     await notifyTaskAccepted({
//       taskId: task._id,
//       winnerWorkerId: worker._id
//     });

//     /* =========================
//        RESPONSE
//     ========================= */
//     return res.status(200).json({
//       success: true,
//       message: "Task accepted successfully",
//       task
//     });

//   } catch (error) {
//     console.error("Accept Task Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message
//     });
//   }
// };

export const acceptTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

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

    // 1️⃣ Ban Check
    if (worker.banExpiresAt && new Date(worker.banExpiresAt) > new Date()) {
      return res.status(403).json({
        success: false,
        message: `You are banned until ${new Date(worker.banExpiresAt).toLocaleString()}`
      });
    }

    // 2️⃣ Online / Busy Logic
    if (!worker.isOnline) {
      const activeTask = await Task.findOne({
        assignedWorkerId: worker._id,
        status: { $in: ["assigned", "arrived", "inProgress"] }
      });

      if (!activeTask) {
        return res.status(403).json({
          success: false,
          message: "You are offline. Go online to accept tasks."
        });
      }
      // If activeTask exists → worker is busy → allow queueing
    }

    /* =========================
       FIRST TAP WINS (ATOMIC)
       ONLY CHECK:
       - status
       - expiresAt
    ========================= */
    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        status: "broadcasting",
        expiresAt: { $gte: new Date() }   // ✅ Correct expiry logic
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
       REAL-TIME: remove task from every other worker's dashboard
    ========================= */
    try {
      const { getIO } = await import("../services/socket.service.js");
      // Broadcast to all connected sockets — each worker's client
      // listens for 'task_accepted' and removes that task from its list
      getIO().emit("task_accepted", {
        taskId: task._id.toString(),
        acceptedByWorkerId: worker._id.toString()
      });
    } catch (_) {
      // Socket not available — workers will just refresh on next poll
    }

    /* =========================
       SUCCESS RESPONSE
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
    /* =========================
       ROLE CHECK (REDUNDANT)
    ========================= */
    // Removed userType check

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
       NOTIFICATION to USER
    ========================= */
    try {
      const { getIO } = await import("../services/socket.service.js");
      getIO().to(`user:${task.userId.toString()}`).emit("task_completed", {
        taskId: task._id.toString(),
        workerId: worker._id.toString(),
      });
    } catch (_) {}

    // Persist notification
    try {
      const { createNotification } = await import("../controller/notificationController.js");
      await createNotification({
        userId: task.userId,
        taskId: task._id,
        type: "completed",
        title: "Task Completed! 🎉",
        message: "The worker has finished your task. Please review and confirm.",
        taskTitle: task.title,
      });
    } catch (_) {}

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
    /* =========================
       ROLE CHECK (REDUNDANT)
    ========================= */
    // Removed userType check

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
        status: { $in: ["assigned", "arrived", "inProgress"] }
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
    const { lat, lng, distance = 10, category } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Location (lat, lng) is required to find nearby tasks"
      });
    }

    const radiusInRadians = distance / 6378.1;

    const query = {
      status: "broadcasting",
      expiresAt: { $gte: new Date() }, // ← never return expired tasks
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
      .populate("userId", "name avatar rating")
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

/* ─────────────────────────────────────────────────────────────
   HTTP FALLBACK: updateWorkerLocation
   POST /api/worker/tasks/:taskId/location
   Body: { lat, lng }
   Used when socket is unavailable / as backup
───────────────────────────────────────────────────────────── */
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const bearingDeg = (lat1, lng1, lat2, lng2) => {
  const dL = ((lng2 - lng1) * Math.PI) / 180;
  const rl1 = (lat1 * Math.PI) / 180;
  const rl2 = (lat2 * Math.PI) / 180;
  const y = Math.sin(dL) * Math.cos(rl2);
  const x =
    Math.cos(rl1) * Math.sin(rl2) - Math.sin(rl1) * Math.cos(rl2) * Math.cos(dL);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

export const updateWorkerLocation = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { lat, lng } = req.body;
    const userId = req.user.id;

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (
      isNaN(parsedLat) || isNaN(parsedLng) ||
      parsedLat < -90 || parsedLat > 90 ||
      parsedLng < -180 || parsedLng > 180
    ) {
      return res.status(400).json({ success: false, message: "Invalid coordinates" });
    }

    const worker = await Worker.findOne({ userId });
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const now = Date.now();

    /* Speed / bearing from previous location */
    if (worker.workerLocation?.lat != null) {
      const deltaKm = haversineKm(
        worker.workerLocation.lat, worker.workerLocation.lng,
        parsedLat, parsedLng
      );
      const deltaHr = (now - new Date(worker.workerLocation.updatedAt).getTime()) / 3600000;
      worker.currentSpeed = deltaHr > 0 ? Math.round(deltaKm / deltaHr) : 0;
      worker.currentBearing = Math.round(
        bearingDeg(worker.workerLocation.lat, worker.workerLocation.lng, parsedLat, parsedLng)
      );
    }

    worker.workerLocation = { lat: parsedLat, lng: parsedLng, updatedAt: new Date() };
    worker.routeHistory.push({ lat: parsedLat, lng: parsedLng });
    if (worker.routeHistory.length > 500) worker.routeHistory = worker.routeHistory.slice(-500);
    worker.lastSeenAt = new Date();
    await worker.save();

    /* Check arrival */
    let distanceKm = null;
    let hasArrived = false;
    if (task.location?.coordinates?.length === 2) {
      const [destLng, destLat] = task.location.coordinates;
      distanceKm = haversineKm(parsedLat, parsedLng, destLat, destLng);
      if (distanceKm < 0.05 && task.status === "inProgress") {
        task.status = "arrived";
        task.arrivedAt = new Date();
        await task.save();
        hasArrived = true;
      }
    }

    /* Emit to user room via Socket.IO */
    try {
      const { getIO } = await import("../services/socket.service.js");
      getIO()
        .to(`user:${task.userId.toString()}`)
        .emit("live_location_update", {
          taskId,
          workerId: worker._id,
          lat: parsedLat,
          lng: parsedLng,
          speed: worker.currentSpeed,
          bearing: worker.currentBearing,
          distanceKm: distanceKm ? parseFloat(distanceKm.toFixed(3)) : null,
          hasArrived,
          timestamp: now,
        });
    } catch (_) {
      // Socket might not be available in test environments
    }

    return res.status(200).json({
      success: true,
      distanceKm: distanceKm ? parseFloat(distanceKm.toFixed(3)) : null,
      hasArrived,
      speed: worker.currentSpeed,
      bearing: worker.currentBearing,
    });

  } catch (error) {
    console.error("updateWorkerLocation Error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
// =============================================================
//  MARK ARRIVED — worker announces arrival (manual, not GPS)
//  1. Generates 4-digit OTP
//  2. Saves it on the Task (field is select:false)
//  3. Emails OTP to the job-poster via Nodemailer
//  4. Sets task.status = "arrived"
// =============================================================
export const markArrived = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    // Resolve worker
    const worker = await Worker.findOne({ userId });
    if (!worker) return res.status(404).json({ message: "Worker profile not found" });

    // Fetch task with OTP fields (select: false overridden here explicitly)
    const task = await Task.findById(taskId).select("+otp +otpExpiresAt");
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Authorisation: must be the assigned worker
    if (!task.assignedWorkerId || task.assignedWorkerId.toString() !== worker._id.toString()) {
      return res.status(403).json({ message: "Not authorised for this task" });
    }

    // Must be in 'assigned' or 'arrived' status (arrived = resend OTP)
    if (task.status !== "assigned" && task.status !== "arrived") {
      return res.status(400).json({
        message: `Cannot mark arrived when task status is '${task.status}'`,
      });
    }

    // Generate 4-digit OTP
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Persist OTP + status change
    task.otp = otp;
    task.otpExpiresAt = otpExpiresAt;
    task.status = "arrived";
    task.arrivedAt = new Date();
    await task.save();

    // Fetch the job-poster's email and name
    const jobPoster = await User.findById(task.userId).select("email name");
    if (!jobPoster) {
      return res.status(404).json({ message: "Job poster user not found" });
    }

    // Send OTP email
    try {
      const { sendOTPEmail } = await import("../services/email.service.js");
      await sendOTPEmail({
        toEmail:    jobPoster.email,
        userName:   jobPoster.name,
        otp,
        taskTitle:  task.title,
        workerName: worker.userId?.name || "Your worker",
      });
      console.log(`[OTP] Sent to ${jobPoster.email} for task ${task._id}`);
    } catch (mailErr) {
      console.error("[OTP] Email send failed:", mailErr.message);
      // Do NOT fail the request — task status is already updated
    }

    // Emit socket update — include OTP so user's app can show it
    try {
      const { getIO } = await import("../services/socket.service.js");
      getIO().to(`user:${task.userId.toString()}`).emit("task_arrived", {
        taskId: task._id.toString(),
        workerId: worker._id.toString(),
        otp,
        taskTitle: task.title,
      });
    } catch (_) {}

    // Persist notification to DB (3-day TTL)
    try {
      const { createNotification } = await import("../controller/notificationController.js");
      await createNotification({
        userId: task.userId,
        taskId: task._id,
        type: "arrived",
        title: "Worker Has Arrived!",
        message: "Share the code with the worker to start the task.",
        otp,
        taskTitle: task.title,
      });
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: "Arrival recorded. OTP sent to the job poster's email.",
      otpExpiresAt,
    });
  } catch (error) {
    console.error("markArrived Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =============================================================
//  VERIFY OTP — worker submits the code shown by the user
//  On success: task.status → 'inProgress'
// =============================================================
export const verifyOTP = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { otp } = req.body;
    const userId = req.user._id;

    if (!otp) return res.status(400).json({ message: "OTP is required" });

    const worker = await Worker.findOne({ userId });
    if (!worker) return res.status(404).json({ message: "Worker profile not found" });

    // Must fetch OTP (select: false)
    const task = await Task.findById(taskId).select("+otp +otpExpiresAt +otpVerifiedAt");
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Authorisation
    if (!task.assignedWorkerId || task.assignedWorkerId.toString() !== worker._id.toString()) {
      return res.status(403).json({ message: "Not authorised for this task" });
    }

    // Must be in 'arrived' status
    if (task.status !== "arrived") {
      return res.status(400).json({ message: `Task is not in 'arrived' state (currently '${task.status}')` });
    }

    // Expiry check
    if (!task.otpExpiresAt || new Date() > new Date(task.otpExpiresAt)) {
      return res.status(400).json({
        success: false,
        expired: true,
        message: "OTP has expired. Please tap \"I've Arrived\" again to get a new code.",
      });
    }

    // Code match
    if (task.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: "Incorrect OTP. Please try again." });
    }

    // OTP verified — start the task
    task.status = "inProgress";
    task.otpVerifiedAt = new Date();
    task.otp = null;            // invalidate code
    task.otpExpiresAt = null;
    await task.save();

    // Emit socket update to user
    try {
      const { getIO } = await import("../services/socket.service.js");
      getIO().to(`user:${task.userId.toString()}`).emit("task_started", {
        taskId: task._id.toString(),
        workerId: worker._id.toString(),
      });
    } catch (_) {}

    // Persist notification
    try {
      const { createNotification } = await import("../controller/notificationController.js");
      await createNotification({
        userId: task.userId,
        taskId: task._id,
        type: "started",
        title: "Task In Progress",
        message: "The worker has verified the OTP. Your task is now being worked on!",
        taskTitle: task.title,
      });
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: "OTP verified! Task is now In Progress.",
    });
  } catch (error) {
    console.error("verifyOTP Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
