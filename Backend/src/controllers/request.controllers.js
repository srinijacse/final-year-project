import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Request } from "../models/request.model.js";
import { Chat } from "../models/chat.model.js";
import { Notification } from "../models/notification.model.js";

export const createRequest = asyncHandler(async (req, res) => {
  const { receiverID, message } = req.body;
  const senderID = req.user._id;

  if (!receiverID) {
    throw new ApiError(400, "Receiver ID is required.");
  }

  if (senderID.toString() === receiverID.toString()) {
    throw new ApiError(400, "You cannot send a connection request to yourself.");
  }

  const receiver = await User.findById(receiverID);
  if (!receiver) {
    throw new ApiError(404, "Target user not found.");
  }

  // Check if a request already exists between the two users
  const existingRequest = await Request.findOne({
    $or: [
      { sender: senderID, receiver: receiverID },
      { sender: receiverID, receiver: senderID },
    ],
  });

  if (existingRequest) {
    if (existingRequest.status === "Accepted") {
      throw new ApiError(400, "You are already connected with this user.");
    }
    if (existingRequest.status === "Pending") {
      throw new ApiError(400, "A connection request is already pending.");
    }
    // If previously rejected, update to pending
    existingRequest.sender = senderID;
    existingRequest.receiver = receiverID;
    existingRequest.status = "Pending";
    existingRequest.message = message || "";
    await existingRequest.save();

    await Notification.create({
      recipient: receiverID,
      sender: senderID,
      type: "CONNECTION_REQUEST",
      title: "New Connection Request",
      message: `${req.user.name} sent you a connection request.`,
      link: "/connections",
      metadata: { requestId: existingRequest._id },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, existingRequest, "Connection request sent successfully."));
  }

  const newRequest = await Request.create({
    sender: senderID,
    receiver: receiverID,
    message: message || "",
    status: "Pending",
  });

  await Notification.create({
    recipient: receiverID,
    sender: senderID,
    type: "CONNECTION_REQUEST",
    title: "New Connection Request",
    message: `${req.user.name} sent you a connection request.`,
    link: "/connections",
    metadata: { requestId: newRequest._id },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newRequest, "Connection request sent successfully."));
});

export const getRequests = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  const incomingRequests = await Request.find({
    receiver: currentUserId,
    status: "Pending",
  })
    .populate("sender", "name username picture bio rating skillsProficientAt skillsToLearn")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      incomingRequests,
      "Incoming connection requests fetched successfully."
    )
  );
});

export const getOutgoingRequests = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  const outgoingRequests = await Request.find({
    sender: currentUserId,
    status: "Pending",
  })
    .populate("receiver", "name username picture bio rating skillsProficientAt skillsToLearn")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      outgoingRequests,
      "Outgoing connection requests fetched successfully."
    )
  );
});

export const getConnections = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  const acceptedRequests = await Request.find({
    status: "Accepted",
    $or: [{ sender: currentUserId }, { receiver: currentUserId }],
  })
    .populate("sender", "name username picture bio rating skillsProficientAt skillsToLearn location availability")
    .populate("receiver", "name username picture bio rating skillsProficientAt skillsToLearn location availability")
    .sort({ updatedAt: -1 });

  const connectedUsers = acceptedRequests.map((r) => {
    return r.sender._id.toString() === currentUserId.toString()
      ? r.receiver
      : r.sender;
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      connectedUsers,
      "Connected users fetched successfully."
    )
  );
});

export const acceptRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  const currentUserId = req.user._id;

  let request = await Request.findOne({
    _id: requestId,
    receiver: currentUserId,
    status: "Pending",
  });

  // Also support passing sender's user ID as requestId for compatibility
  if (!request) {
    request = await Request.findOne({
      sender: requestId,
      receiver: currentUserId,
      status: "Pending",
    });
  }

  if (!request) {
    throw new ApiError(404, "Pending connection request not found.");
  }

  request.status = "Accepted";
  await request.save();

  // Create Chat between the two users if it doesn't already exist
  let chat = await Chat.findOne({
    users: { $all: [request.sender, currentUserId] },
  });

  if (!chat) {
    chat = await Chat.create({
      users: [request.sender, currentUserId],
    });
  }

  // Update connections count
  await User.findByIdAndUpdate(request.sender, { $inc: { connectionsCount: 1 } });
  await User.findByIdAndUpdate(currentUserId, { $inc: { connectionsCount: 1 } });

  // Send notification to sender
  await Notification.create({
    recipient: request.sender,
    sender: currentUserId,
    type: "CONNECTION_ACCEPTED",
    title: "Connection Request Accepted 🎉",
    message: `${req.user.name} accepted your connection request. You can now chat and arrange learning sessions!`,
    link: "/chats",
    metadata: { chatId: chat._id },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { request, chat },
      "Connection request accepted successfully."
    )
  );
});

export const rejectRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  const currentUserId = req.user._id;

  let request = await Request.findOne({
    _id: requestId,
    receiver: currentUserId,
  });

  if (!request) {
    request = await Request.findOne({
      sender: requestId,
      receiver: currentUserId,
    });
  }

  if (!request) {
    throw new ApiError(404, "Connection request not found.");
  }

  request.status = "Rejected";
  await request.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Connection request rejected."));
});

export const cancelRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const currentUserId = req.user._id;

  const request = await Request.findOneAndDelete({
    _id: requestId,
    sender: currentUserId,
    status: "Pending",
  });

  if (!request) {
    throw new ApiError(404, "Outgoing request not found or already processed.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Connection request cancelled."));
});
