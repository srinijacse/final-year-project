import { generateJWTToken } from "../utils/generateJWTToken.js";

import { User } from "../models/user.model.js";

import { asyncHandler } from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";

import { ApiResponse } from "../utils/ApiResponse.js";

export const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    username,
    password,
    skillsProficientAt,
    skillsToLearn,

    // Profile fields
    bio,
    location,
    experienceLevel,
    availability,

    // Optional links
    linkedinLink,
    githubLink,
    portfolioLink,
  } = req.body;

  // ==========================================
  // REQUIRED FIELD VALIDATION
  // ==========================================

  if (!name || !email || !password || !username) {
    throw new ApiError(
      400,
      "Please provide name, email, username, and password."
    );
  }

  if (!experienceLevel) {
    throw new ApiError(
      400,
      "Please select your experience level."
    );
  }

  if (!availability || !availability.trim()) {
    throw new ApiError(
      400,
      "Please provide your availability."
    );
  }

  // ==========================================
  // NORMALIZE EMAIL & USERNAME
  // ==========================================

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.toLowerCase().trim();

  // ==========================================
  // VALIDATE EMAIL FORMAT
  // ==========================================

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    throw new ApiError(
      400,
      "Please provide a valid email address."
    );
  }

  // ==========================================
  // VALIDATE PASSWORD
  // ==========================================

  if (password.length < 6) {
    throw new ApiError(
      400,
      "Password must be at least 6 characters long."
    );
  }

  // ==========================================
  // VALIDATE EXPERIENCE LEVEL
  // ==========================================

  const validExperienceLevels = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert",
  ];

  if (!validExperienceLevels.includes(experienceLevel)) {
    throw new ApiError(
      400,
      "Please provide a valid experience level."
    );
  }

  // ==========================================
  // VALIDATE SKILLS
  // ==========================================

  if (
    !Array.isArray(skillsProficientAt) ||
    skillsProficientAt.length === 0
  ) {
    throw new ApiError(
      400,
      "Please provide at least one skill you can teach."
    );
  }

  if (
    !Array.isArray(skillsToLearn) ||
    skillsToLearn.length === 0
  ) {
    throw new ApiError(
      400,
      "Please provide at least one skill you want to learn."
    );
  }

  // ==========================================
  // CHECK DUPLICATE EMAIL / USERNAME
  // ==========================================

  const existingUser = await User.findOne({
    $or: [
      { email: normalizedEmail },
      { username: normalizedUsername },
    ],
  });

  if (existingUser) {
    if (existingUser.email === normalizedEmail) {
      throw new ApiError(
        400,
        "An account with this email already exists."
      );
    }

    if (existingUser.username === normalizedUsername) {
      throw new ApiError(
        400,
        "This username is already taken. Please choose another."
      );
    }
  }

  // ==========================================
  // FORMAT TEACHING SKILLS
  // ==========================================

  const formattedTeachSkills = skillsProficientAt.map((s) => {
    if (typeof s === "string") {
      return {
        name: s,
        category: "Other",
        status: "Claimed",
      };
    }

    return {
      name: s.name,
      category: s.category || "Other",
      status: s.status || "Claimed",
    };
  });

  // ==========================================
  // FORMAT LEARNING SKILLS
  // ==========================================

  const formattedLearnSkills = skillsToLearn.map((s) => {
    if (typeof s === "string") {
      return {
        name: s,
        category: "Other",
      };
    }

    return {
      name: s.name,
      category: s.category || "Other",
    };
  });

  // ==========================================
  // CREATE USER
  // ==========================================

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    username: normalizedUsername,
    password,

    // Skills
    skillsProficientAt: formattedTeachSkills,
    skillsToLearn: formattedLearnSkills,

    // Profile information
    bio: bio ? bio.trim() : "",
    location: location ? location.trim() : "",
    experienceLevel,
    availability: availability.trim(),

    // Optional links
    linkedinLink: linkedinLink ? linkedinLink.trim() : "",
    githubLink: githubLink ? githubLink.trim() : "",
    portfolioLink: portfolioLink ? portfolioLink.trim() : "",
  });

  // ==========================================
  // REMOVE PASSWORD FROM RESPONSE
  // ==========================================

  const createdUser = await User.findById(user._id).select(
    "-password"
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering the user."
    );
  }

  // ==========================================
  // GENERATE JWT
  // ==========================================

  const token = generateJWTToken(createdUser);

  // ==========================================
  // COOKIE OPTIONS
  // ==========================================

  const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

  // ==========================================
  // SET COOKIE
  // ==========================================

  res.cookie(
    "accessToken",
    token,
    cookieOptions
  );

  // ==========================================
  // RESPONSE
  // ==========================================

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: createdUser,
        token,
      },
      "User registered successfully."
    )
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(
      400,
      "Please provide email and password."
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    $or: [
      { email: normalizedEmail },
      { username: normalizedEmail },
    ],
  });

  if (!user) {
    throw new ApiError(
      401,
      "Invalid email or password."
    );
  }

  const isPasswordValid =
    await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(
      401,
      "Invalid email or password."
    );
  }

  const loggedInUser = await User.findById(
    user._id
  ).select("-password");

  const token = generateJWTToken(loggedInUser);

  const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

  res.cookie(
    "accessToken",
    token,
    cookieOptions
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,
        token,
      },
      "Logged in successfully."
    )
  );
});

export const handleLogout = asyncHandler(async (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  };

  res.clearCookie(
    "accessToken",
    cookieOptions
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "User logged out successfully."
      )
    );
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(
    req.user._id
  ).select("-password");

  if (!user) {
    throw new ApiError(
      404,
      "User not found."
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user,
        "Current user fetched successfully."
      )
    );
});