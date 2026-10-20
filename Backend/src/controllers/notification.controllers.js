import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Notification } from "../models/notification.model.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate("sender", "name username picture")
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { notifications, unreadCount },
      "Notifications fetched successfully."
    )
  );
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (notificationId === "all") {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, null, "All notifications marked as read."));
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: req.user._id },
    { $set: { isRead: true } },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read."));
});

export const clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });
  return res
    .status(200)
    .json(new ApiResponse(200, null, "All notifications cleared."));
});
