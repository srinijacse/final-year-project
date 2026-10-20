import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Message } from "../models/message.model.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body;

  if (!chatId || !content || !content.trim()) {
    throw new ApiError(400, "Please provide chatId and message content.");
  }

  const senderId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, "Chat conversation not found.");
  }

  if (!chat.users.some((u) => u.toString() === senderId.toString())) {
    throw new ApiError(403, "You are not a participant in this conversation.");
  }

  let message = await Message.create({
    chatId,
    sender: senderId,
    content: content.trim(),
    readBy: [senderId],
  });

  message = await message.populate("sender", "name username picture");
  message = await message.populate("chatId");

  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: message._id,
  });

  // Notify other recipient
  const recipientId = chat.users.find(
    (u) => u.toString() !== senderId.toString()
  );

  if (recipientId) {
    try {
      await Notification.create({
        recipient: recipientId,
        sender: senderId,
        type: "NEW_MESSAGE",
        title: `Message from ${req.user.name}`,
        message: content.length > 60 ? `${content.substring(0, 60)}...` : content,
        link: "/chats",
        metadata: { chatId, messageId: message._id },
      });
    } catch (notifErr) {
      console.log("Failed to create message notification:", notifErr.message);
    }
  }

  return res
    .status(201)
    .json(new ApiResponse(201, message, "Message sent successfully"));
});

export const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, "Chat not found.");
  }

  if (!chat.users.some((u) => u.toString() === req.user._id.toString())) {
    throw new ApiError(403, "Access denied to this chat.");
  }

  const messages = await Message.find({ chatId })
    .populate("sender", "name username picture")
    .sort({ createdAt: 1 });

  // Mark all unread messages in this chat as read by current user
  await Message.updateMany(
    { chatId, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages fetched successfully"));
});
