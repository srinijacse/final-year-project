import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Authentication token missing. Please log in.");
    }

    const secret =
      process.env.JWT_SECRET || "skillswap_super_secret_jwt_key_2026_secure";
    const decodedToken = jwt.verify(token, secret);

    const user = await User.findById(decodedToken?._id || decodedToken?.id).select(
      "-password"
    );

    if (!user) {
      // Fallback lookup by username if _id was not found
      const userByUsername = await User.findOne({
        username: decodedToken?.username,
      }).select("-password");
      if (!userByUsername) {
        throw new ApiError(401, "Invalid access token or user not found.");
      }
      req.user = userByUsername;
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Session expired. Please log in again.");
    } else {
      throw new ApiError(401, error.message || "Unauthorized access.");
    }
  }
});

// Aliases for compatibility
const verifyJWT_username = verifyJWT;
const verifyJWT_email = verifyJWT;

export { verifyJWT, verifyJWT_username, verifyJWT_email };
