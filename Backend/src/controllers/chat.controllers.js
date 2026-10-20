import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { Request } from "../models/request.model.js";

export const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "UserId param not sent with request");
  }

  const currentUserId = req.user._id;

  // Verify connection
  const connection = await Request.findOne({
    status: "Accepted",
    $or: [
      { sender: currentUserId, receiver: userId },
      { sender: userId, receiver: currentUserId },
    ],
  });

  if (!connection) {
    throw new ApiError(400, "You must be connected with this user to start a chat.");
  }

  let chat = await Chat.findOne({
    users: { $all: [currentUserId, userId] },
  })
    .populate("users", "name username picture bio location rating")
    .populate("latestMessage");

  if (!chat) {
    const createdChat = await Chat.create({
      users: [currentUserId, userId],
    });
    chat = await Chat.findById(createdChat._id).populate(
      "users",
      "name username picture bio location rating"
    );
  }

  return res.status(200).json(new ApiResponse(200, chat, "Chat retrieved successfully"));
});

export const getChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const chats = await Chat.find({ users: { $elemMatch: { $eq: userId } } })
    .populate("users", "name username picture bio location rating")
    .populate({
      path: "latestMessage",
      populate: {
        path: "sender",
        select: "name username picture",
      },
    })
    .sort({ updatedAt: -1 });

  return res.status(200).json(new ApiResponse(200, chats, "Chats fetched successfully"));
});
