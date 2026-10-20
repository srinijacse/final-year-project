import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Session } from "../models/session.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { Request } from "../models/request.model.js";

export const createSession = asyncHandler(async (req, res) => {
  const { teacherId, learnerId, skill, title, description, date, time, duration, meetingLink } =
    req.body;

  if (!teacherId || !learnerId || !skill || !title || !date || !time) {
    throw new ApiError(400, "Please provide all required session details.");
  }

  const currentUserId = req.user._id.toString();
  if (currentUserId !== teacherId && currentUserId !== learnerId) {
    throw new ApiError(403, "You can only arrange sessions where you are the teacher or learner.");
  }

  const otherUserId = currentUserId === teacherId ? learnerId : teacherId;

  // Verify that users are connected
  const connection = await Request.findOne({
    status: "Accepted",
    $or: [
      { sender: currentUserId, receiver: otherUserId },
      { sender: otherUserId, receiver: currentUserId },
    ],
  });

  if (!connection) {
    throw new ApiError(400, "You must be connected with this user to schedule a session.");
  }

  const session = await Session.create({
    teacher: teacherId,
    learner: learnerId,
    createdBy: currentUserId,
    skill,
    title,
    description: description || "",
    date,
    time,
    duration: duration || 60,
    meetingLink: meetingLink || "",
    status: "Requested",
  });

  // Create notification for the other user
  await Notification.create({
    recipient: otherUserId,
    sender: req.user._id,
    type: "SESSION_REQUEST",
    title: "New Learning Session Request",
    message: `${req.user.name} requested a learning session for ${skill}: "${title}" on ${date} at ${time}.`,
    link: "/sessions",
    metadata: { sessionId: session._id },
  });

  const populatedSession = await Session.findById(session._id)
    .populate("teacher", "name username picture rating")
    .populate("learner", "name username picture rating");

  return res
    .status(201)
    .json(new ApiResponse(201, populatedSession, "Session requested successfully."));
});

export const getUserSessions = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const sessions = await Session.find({
    $or: [{ teacher: userId }, { learner: userId }],
  })
    .populate("teacher", "name username picture rating")
    .populate("learner", "name username picture rating")
    .sort({ createdAt: -1 });

  const upcoming = sessions.filter((s) => s.status === "Accepted");
  const pendingRequests = sessions.filter((s) => s.status === "Requested");
  const completed = sessions.filter((s) => s.status === "Completed");
  const cancelled = sessions.filter(
    (s) => s.status === "Cancelled" || s.status === "Rejected"
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { all: sessions, upcoming, pendingRequests, completed, cancelled },
      "User sessions fetched successfully."
    )
  );
});

export const acceptSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new ApiError(404, "Session not found.");
  }

  if (session.createdBy.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot accept your own session request.");
  }

  const isParticipant =
    session.teacher.toString() === req.user._id.toString() ||
    session.learner.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw new ApiError(403, "Unauthorized to accept this session.");
  }

  session.status = "Accepted";
  await session.save();

  // Notify creator
  await Notification.create({
    recipient: session.createdBy,
    sender: req.user._id,
    type: "SESSION_ACCEPTED",
    title: "Session Request Accepted",
    message: `${req.user.name} accepted your learning session: "${session.title}".`,
    link: "/sessions",
    metadata: { sessionId: session._id },
  });

  const populated = await Session.findById(session._id)
    .populate("teacher", "name username picture")
    .populate("learner", "name username picture");

  return res
    .status(200)
    .json(new ApiResponse(200, populated, "Session accepted successfully."));
});

export const rejectSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new ApiError(404, "Session not found.");
  }

  session.status = "Rejected";
  await session.save();

  // Notify creator
  await Notification.create({
    recipient: session.createdBy,
    sender: req.user._id,
    type: "SESSION_REJECTED",
    title: "Session Request Declined",
    message: `${req.user.name} was unable to accept the session request: "${session.title}".`,
    link: "/sessions",
    metadata: { sessionId: session._id },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, session, "Session rejected successfully."));
});

export const completeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new ApiError(404, "Session not found.");
  }

  const isParticipant =
    session.teacher.toString() === req.user._id.toString() ||
    session.learner.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw new ApiError(403, "Unauthorized to complete this session.");
  }

  session.status = "Completed";
  session.completedAt = new Date();
  await session.save();

  // Increment completed sessions count for both participants
  await User.findByIdAndUpdate(session.teacher, {
    $inc: { completedSessions: 1 },
  });
  await User.findByIdAndUpdate(session.learner, {
    $inc: { completedSessions: 1 },
  });

  const otherId =
    session.teacher.toString() === req.user._id.toString()
      ? session.learner
      : session.teacher;

  // Send completion & review reminder notification
  await Notification.create({
    recipient: otherId,
    sender: req.user._id,
    type: "SESSION_COMPLETED",
    title: "Session Completed • Share Feedback",
    message: `Your learning session "${session.title}" for ${session.skill} has been marked completed. Leave a review to build community credibility!`,
    link: `/profile/${req.user.username}`,
    metadata: { sessionId: session._id, skill: session.skill },
  });

  const populated = await Session.findById(session._id)
    .populate("teacher", "name username picture")
    .populate("learner", "name username picture");

  return res
    .status(200)
    .json(new ApiResponse(200, populated, "Session marked as completed."));
});

export const cancelSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new ApiError(404, "Session not found.");
  }

  session.status = "Cancelled";
  await session.save();

  const otherId =
    session.teacher.toString() === req.user._id.toString()
      ? session.learner
      : session.teacher;

  await Notification.create({
    recipient: otherId,
    sender: req.user._id,
    type: "SESSION_CANCELLED",
    title: "Session Cancelled",
    message: `${req.user.name} cancelled the learning session: "${session.title}".`,
    link: "/sessions",
    metadata: { sessionId: session._id },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, session, "Session cancelled successfully."));
});
