import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Request } from "../models/request.model.js";
import { Rating } from "../models/rating.model.js";

// Helper: Calculate Match Details & Score between 2 users
export const calculateMatch = (currentUser, targetUser) => {
  const userWants = (currentUser.skillsToLearn || []).map((s) =>
    (s.name || s).toLowerCase().trim()
  );
  const userTeaches = (currentUser.skillsProficientAt || []).map((s) =>
    (s.name || s).toLowerCase().trim()
  );

  const targetTeachesList = targetUser.skillsProficientAt || [];
  const targetWantsList = targetUser.skillsToLearn || [];

  // Skills target teaches that current user wants
  const directMatches = targetTeachesList.filter((s) =>
    userWants.includes((s.name || s).toLowerCase().trim())
  );

  // Skills target wants that current user teaches (Mutual Swap!)
  const mutualMatches = targetWantsList.filter((s) =>
    userTeaches.includes((s.name || s).toLowerCase().trim())
  );

  let score = 0;

  // 1. Direct Skill Match (Up to 40 pts)
  if (directMatches.length > 0) {
    score += Math.min(directMatches.length * 20, 40);
  }

  // 2. Mutual Match / Skill Swap (Up to 25 pts)
  if (mutualMatches.length > 0) {
    score += Math.min(mutualMatches.length * 15, 25);
  }

  // 3. Verification bonus of matching teaching skills (Up to 20 pts)
  directMatches.forEach((s) => {
    if (s.status === "Verified + Portfolio") score += 10;
    else if (s.status === "Verified") score += 6;
    else score += 2;
  });

  // 4. Rating bonus (Up to 10 pts)
  const userRating = targetUser.rating || 5;
  score += Math.round((userRating / 5) * 10);

  // 5. Completed sessions bonus (Up to 5 pts)
  const sessions = targetUser.completedSessions || 0;
  score += Math.min(sessions, 5);

  const finalScore = Math.min(Math.max(score, 10), 100);

  const matchReasons = [];
  if (directMatches.length > 0) {
    const names = directMatches.map((s) => s.name || s).join(", ");
    matchReasons.push(`Teaches ${directMatches.length} skill(s) you want to learn: ${names}`);
  }
  if (mutualMatches.length > 0) {
    const names = mutualMatches.map((s) => s.name || s).join(", ");
    matchReasons.push(`Mutual Skill Swap: Wants to learn ${names} which you teach!`);
  }
  if (directMatches.some((s) => s.status && s.status.includes("Verified"))) {
    matchReasons.push("Verified skill credentials with assessment proof");
  }
  if (targetUser.rating >= 4.5) {
    matchReasons.push(`High community rating (${targetUser.rating.toFixed(1)} ⭐)`);
  }

  return {
    matchScore: finalScore,
    isMutualMatch: mutualMatches.length > 0 && directMatches.length > 0,
    directMatches,
    mutualMatches,
    matchReasons,
  };
};

export const userDetailsWithoutID = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details fetched successfully"));
});

export const UserDetails = asyncHandler(async (req, res) => {
  const username = req.params.username.toLowerCase().trim();

  const user = await User.findOne({ username }).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let connectionStatus = "Connect";
  if (req.user && req.user._id.toString() !== user._id.toString()) {
    const request = await Request.findOne({
      $or: [
        { sender: req.user._id, receiver: user._id },
        { sender: user._id, receiver: req.user._id },
      ],
    });

    if (request) {
      if (request.status === "Accepted") {
        connectionStatus = "Connected";
      } else if (request.status === "Pending") {
        connectionStatus =
          request.sender.toString() === req.user._id.toString()
            ? "Pending"
            : "Incoming Request";
      } else {
        connectionStatus = "Connect";
      }
    }
  }

  // Fetch reviews received by this user
  const reviews = await Rating.find({ reviewee: user._id })
    .populate("rater", "name username picture")
    .sort({ createdAt: -1 });

  // Compute match details if viewer is logged in
  let matchInfo = null;
  if (req.user && req.user._id.toString() !== user._id.toString()) {
    matchInfo = calculateMatch(req.user, user);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...user._doc,
        connectionStatus,
        status: connectionStatus,
        reviews,
        matchInfo,
      },
      "User details fetched successfully"
    )
  );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const {
    name,
    bio,
    location,
    experienceLevel,
    availability,
    picture,
    linkedinLink,
    githubLink,
    portfolioLink,
    skillsProficientAt,
    skillsToLearn,
    education,
    projects,
  } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (bio !== undefined) updates.bio = bio.trim();
  if (location !== undefined) updates.location = location.trim();
  if (experienceLevel !== undefined) updates.experienceLevel = experienceLevel;
  if (availability !== undefined) updates.availability = availability.trim();
  if (picture !== undefined) updates.picture = picture;
  if (linkedinLink !== undefined) updates.linkedinLink = linkedinLink.trim();
  if (githubLink !== undefined) updates.githubLink = githubLink.trim();
  if (portfolioLink !== undefined) updates.portfolioLink = portfolioLink.trim();
  if (education !== undefined) updates.education = education;
  if (projects !== undefined) updates.projects = projects;

  // Clean and preserve skill statuses when updating skills
  if (skillsProficientAt !== undefined) {
    const existingUser = await User.findById(req.user._id);
    const existingSkillsMap = new Map();
    (existingUser.skillsProficientAt || []).forEach((s) => {
      existingSkillsMap.set(s.name.toLowerCase(), s);
    });

    updates.skillsProficientAt = skillsProficientAt.map((s) => {
      const sName = typeof s === "string" ? s : s.name;
      const sCat = (typeof s === "object" && s.category) ? s.category : "Other";
      const existing = existingSkillsMap.get(sName.toLowerCase());
      if (existing) {
        return {
          name: sName,
          category: sCat,
          status: existing.status || "Claimed",
          assessmentScore: existing.assessmentScore,
          verifiedAt: existing.verifiedAt,
          githubEvidence: existing.githubEvidence,
        };
      }
      return {
        name: sName,
        category: sCat,
        status: typeof s === "object" && s.status ? s.status : "Claimed",
        assessmentScore: typeof s === "object" ? s.assessmentScore : null,
      };
    });
  }

  if (skillsToLearn !== undefined) {
    updates.skillsToLearn = skillsToLearn.map((s) => {
      const sName = typeof s === "string" ? s : s.name;
      const sCat = (typeof s === "object" && s.category) ? s.category : "Other";
      return { name: sName, category: sCat };
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

export const addTeachingSkill = asyncHandler(async (req, res) => {
  const { name, category } = req.body;
  if (!name) {
    throw new ApiError(400, "Skill name is required");
  }

  const user = await User.findById(req.user._id);
  const exists = user.skillsProficientAt.some(
    (s) => s.name.toLowerCase() === name.toLowerCase()
  );
  if (exists) {
    throw new ApiError(400, "Skill already exists in your teaching skills list");
  }

  user.skillsProficientAt.push({
    name: name.trim(),
    category: category || "Other",
    status: "Claimed",
  });

  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, user.skillsProficientAt, "Skill added successfully"));
});

export const removeTeachingSkill = asyncHandler(async (req, res) => {
  const { skillName } = req.params;
  const user = await User.findById(req.user._id);
  user.skillsProficientAt = user.skillsProficientAt.filter(
    (s) => s.name.toLowerCase() !== skillName.toLowerCase()
  );
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, user.skillsProficientAt, "Skill removed successfully"));
});

export const addLearningSkill = asyncHandler(async (req, res) => {
  const { name, category } = req.body;
  if (!name) {
    throw new ApiError(400, "Skill name is required");
  }

  const user = await User.findById(req.user._id);
  const exists = user.skillsToLearn.some(
    (s) => s.name.toLowerCase() === name.toLowerCase()
  );
  if (exists) {
    throw new ApiError(400, "Skill already exists in your learning list");
  }

  user.skillsToLearn.push({
    name: name.trim(),
    category: category || "Other",
  });

  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, user.skillsToLearn, "Learning skill added successfully"));
});

export const removeLearningSkill = asyncHandler(async (req, res) => {
  const { skillName } = req.params;
  const user = await User.findById(req.user._id);
  user.skillsToLearn = user.skillsToLearn.filter(
    (s) => s.name.toLowerCase() !== skillName.toLowerCase()
  );
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, user.skillsToLearn, "Learning skill removed successfully"));
});

export const discoverUsers = asyncHandler(async (req, res) => {
  const { search, category, experienceLevel, verificationFilter, minRating } = req.query;
  const currentUser = req.user;

  // Build Mongo query excluding current user
  const query = { _id: { $ne: currentUser._id } };

  if (experienceLevel) {
    query.experienceLevel = experienceLevel;
  }

  if (minRating) {
    query.rating = { $gte: parseFloat(minRating) };
  }

  const allUsers = await User.find(query).select("-password");

  // Fetch connection statuses for all discovered users with current user
  const requests = await Request.find({
    $or: [{ sender: currentUser._id }, { receiver: currentUser._id }],
  });

  const connectionMap = new Map();
  requests.forEach((reqItem) => {
    const otherId =
      reqItem.sender.toString() === currentUser._id.toString()
        ? reqItem.receiver.toString()
        : reqItem.sender.toString();

    if (reqItem.status === "Accepted") {
      connectionMap.set(otherId, "Connected");
    } else if (reqItem.status === "Pending") {
      connectionMap.set(
        otherId,
        reqItem.sender.toString() === currentUser._id.toString()
          ? "Pending"
          : "Incoming Request"
      );
    }
  });

  // Calculate matching details for all candidates
  let mappedUsers = allUsers.map((u) => {
    const match = calculateMatch(currentUser, u);
    return {
      ...u._doc,
      connectionStatus: connectionMap.get(u._id.toString()) || "Connect",
      matchScore: match.matchScore,
      isMutualMatch: match.isMutualMatch,
      directMatches: match.directMatches,
      mutualMatches: match.mutualMatches,
      matchReasons: match.matchReasons,
    };
  });

  // Text search filter
  if (search && search.trim()) {
    const sTerm = search.toLowerCase().trim();
    mappedUsers = mappedUsers.filter((u) => {
      const matchName = (u.name || "").toLowerCase().includes(sTerm);
      const matchBio = (u.bio || "").toLowerCase().includes(sTerm);
      const matchTeach = (u.skillsProficientAt || []).some((s) =>
        (s.name || "").toLowerCase().includes(sTerm)
      );
      const matchLearn = (u.skillsToLearn || []).some((s) =>
        (s.name || "").toLowerCase().includes(sTerm)
      );
      return matchName || matchBio || matchTeach || matchLearn;
    });
  }

  // Category filter
  if (category && category !== "All") {
    mappedUsers = mappedUsers.filter((u) =>
      (u.skillsProficientAt || []).some(
        (s) => (s.category || "").toLowerCase() === category.toLowerCase()
      )
    );
  }

  // Verification filter
  if (verificationFilter === "verified") {
    mappedUsers = mappedUsers.filter((u) =>
      (u.skillsProficientAt || []).some((s) => s.status && s.status.includes("Verified"))
    );
  } else if (verificationFilter === "portfolio") {
    mappedUsers = mappedUsers.filter((u) =>
      (u.skillsProficientAt || []).some((s) => s.status === "Verified + Portfolio")
    );
  }

  // Sort by match score descending
  mappedUsers.sort((a, b) => b.matchScore - a.matchScore);

  // Group into curated feeds
  const forYou = mappedUsers.filter((u) => u.matchScore >= 50 || u.isMutualMatch);
  const webDev = mappedUsers.filter((u) =>
    (u.skillsProficientAt || []).some(
      (s) =>
        (s.category || "").toLowerCase() === "web development" ||
        ["react", "node.js", "express", "mongodb", "javascript", "html/css"].some((k) =>
          (s.name || "").toLowerCase().includes(k)
        )
    )
  );
  const dataScience = mappedUsers.filter((u) =>
    (u.skillsProficientAt || []).some(
      (s) =>
        (s.category || "").toLowerCase() === "data science" ||
        ["python", "machine learning", "sql", "ai", "pandas"].some((k) =>
          (s.name || "").toLowerCase().includes(k)
        )
    )
  );
  const cloudDevOps = mappedUsers.filter((u) =>
    (u.skillsProficientAt || []).some(
      (s) =>
        (s.category || "").toLowerCase() === "cloud" ||
        (s.category || "").toLowerCase() === "devops" ||
        ["aws", "docker", "kubernetes", "git", "ci/cd"].some((k) =>
          (s.name || "").toLowerCase().includes(k)
        )
    )
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        all: mappedUsers,
        forYou: forYou.length > 0 ? forYou : mappedUsers.slice(0, 6),
        webDev,
        dataScience,
        cloudDevOps,
        total: mappedUsers.length,
      },
      "Users fetched successfully"
    )
  );
});
