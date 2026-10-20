import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Rating } from "../models/rating.model.js";
import { Session } from "../models/session.model.js";
import { Notification } from "../models/notification.model.js";

export const rateUser = asyncHandler(async (req, res) => {
  const { rating, description, username, sessionId, skill } = req.body;

  if (!rating || !description || !username) {
    throw new ApiError(400, "Please provide rating, description, and username.");
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    throw new ApiError(400, "Rating must be a number between 1 and 5.");
  }

  const targetUser = await User.findOne({ username: username.toLowerCase().trim() });
  if (!targetUser) {
    throw new ApiError(404, "Target user not found.");
  }

  const raterId = req.user._id;

  if (raterId.toString() === targetUser._id.toString()) {
    throw new ApiError(400, "You cannot rate or review yourself.");
  }

  // Check duplicate review on session if sessionId provided
  if (sessionId) {
    const existingSessionReview = await Rating.findOne({
      session: sessionId,
      rater: raterId,
    });
    if (existingSessionReview) {
      throw new ApiError(400, "You have already reviewed this learning session.");
    }
  }

  const newRating = await Rating.create({
    session: sessionId || null,
    rater: raterId,
    reviewee: targetUser._id,
    username: targetUser.username,
    skill: skill || "General Peer Learning",
    rating: numRating,
    description: description.trim(),
  });

  // Recalculate average rating for target user
  const allRatings = await Rating.find({ reviewee: targetUser._id });
  const totalScore = allRatings.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = Number((totalScore / allRatings.length).toFixed(2));

  await User.findByIdAndUpdate(targetUser._id, {
    rating: avgRating,
    numRatings: allRatings.length,
  });

  // If sessionId was provided, mark session as reviewed
  if (sessionId) {
    const session = await Session.findById(sessionId);
    if (session) {
      if (session.learner.toString() === raterId.toString()) {
        session.isReviewedByLearner = true;
      }
      if (session.teacher.toString() === raterId.toString()) {
        session.isReviewedByTeacher = true;
      }
      await session.save();
    }
  }

  // Send notification to reviewee
  await Notification.create({
    recipient: targetUser._id,
    sender: raterId,
    type: "NEW_REVIEW",
    title: "New Review Received ⭐",
    message: `${req.user.name} gave you a ${numRating}-star rating: "${description.substring(0, 80)}..."`,
    link: `/profile/${targetUser.username}`,
    metadata: { ratingId: newRating._id, rating: numRating },
  });

  const populatedRating = await Rating.findById(newRating._id).populate(
    "rater",
    "name username picture"
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      { rating: populatedRating, avgRating, totalReviews: allRatings.length },
      "Rating and review submitted successfully."
    )
  );
});

export const getUserRatings = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const targetUser = await User.findOne({ username: username.toLowerCase().trim() });

  if (!targetUser) {
    throw new ApiError(404, "User not found.");
  }

  const ratings = await Rating.find({ reviewee: targetUser._id })
    .populate("rater", "name username picture")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, ratings, "User ratings fetched successfully."));
});
