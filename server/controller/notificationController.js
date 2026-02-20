import Notification from "../modal/user/Notification.js";

/**
 * GET /api/notifications
 * Fetch all notifications for the logged-in user (last 3 days, newest first).
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("getNotifications error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the logged-in user.
 */
export const markAllRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany({ userId, read: false }, { read: true });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("markAllRead error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Helper — called from socket event handlers to persist a notification.
 * Not an HTTP endpoint, used internally.
 */
export const createNotification = async ({
  userId,
  workerId,
  taskId,
  type,
  title,
  message,
  otp = null,
  taskTitle = null,
}) => {
  try {
    const notif = await Notification.create({
      userId,
      workerId,
      taskId,
      type,
      title,
      message,
      otp,
      taskTitle,
    });
    return notif;
  } catch (error) {
    console.error("createNotification error:", error);
    return null;
  }
};
