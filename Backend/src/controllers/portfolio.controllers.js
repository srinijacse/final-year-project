import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { analyzeGitHubRepository } from "../utils/githubAnalyzer.js";

export const analyzeAndVerifyPortfolio = asyncHandler(async (req, res) => {
  const { skill, repoUrl } = req.body;

  if (!skill || !repoUrl) {
    throw new ApiError(
      400,
      "Please provide both the skill name and GitHub repository URL."
    );
  }

  // Get the logged-in user BEFORE GitHub analysis
  // because the analyzer needs the user's githubLink
  // to verify repository ownership.
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const analysisResult = await analyzeGitHubRepository(
    repoUrl,
    skill,
    user
  );

  if (!analysisResult.success) {
    throw new ApiError(
      400,
      analysisResult.error ||
        "Could not analyze the provided GitHub repository."
    );
  }

  const existingIndex = user.skillsProficientAt.findIndex(
    (s) =>
      s.name.toLowerCase() ===
      skill.toLowerCase().trim()
  );

  const githubEvidenceObj = {
    repoUrl: analysisResult.repoUrl,
    repoName: analysisResult.repoName,
    score: analysisResult.score,
    detectedTech: analysisResult.detectedTech,
    evidenceItems: analysisResult.evidenceItems,
    analyzedAt: new Date(),
  };

  if (existingIndex > -1) {
    user.skillsProficientAt[existingIndex].status =
      "Verified + Portfolio";

    user.skillsProficientAt[
      existingIndex
    ].githubEvidence = githubEvidenceObj;

    user.skillsProficientAt[
      existingIndex
    ].verifiedAt = new Date();
  } else {
    user.skillsProficientAt.push({
      name: skill.trim(),
      category: "Other",
      status: "Verified + Portfolio",
      assessmentScore: 80,
      verifiedAt: new Date(),
      githubEvidence: githubEvidenceObj,
    });
  }

  await user.save();

  await Notification.create({
    recipient: user._id,
    type: "PORTFOLIO_ANALYZED",
    title: `Portfolio Evidence Added: ${skill} 🚀`,
    message: `Your repository "${analysisResult.repoName}" was analyzed with a portfolio evidence score of ${analysisResult.score}/100. Badge upgraded to "Verified + Portfolio"!`,
    link: `/profile/${user.username}`,
    metadata: {
      skill,
      analysisResult,
    },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        skill,
        status: "Verified + Portfolio",
        repoName: analysisResult.repoName,
        repoUrl: analysisResult.repoUrl,
        portfolioScore: analysisResult.score,
        detectedTech: analysisResult.detectedTech,
        evidenceItems: analysisResult.evidenceItems,
        analyzedAt: githubEvidenceObj.analyzedAt,
      },
      "GitHub repository analyzed successfully and portfolio evidence badge awarded!"
    )
  );
});