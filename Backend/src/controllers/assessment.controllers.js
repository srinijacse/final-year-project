import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Question, AssessmentAttempt } from "../models/assessment.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { initialQuestions } from "../utils/seedAssessmentData.js";

export const getAssessmentQuestions = asyncHandler(async (req, res) => {
  const { skill } = req.params;

  if (!skill) {
    throw new ApiError(400, "Skill name is required.");
  }

  // Find questions matching skill case-insensitively
  let questions = await Question.find({
    skill: { $regex: new RegExp(`^${skill.trim()}$`, "i") },
  });

  // If no questions in DB yet, query initialQuestions or sample set
  if (!questions || questions.length === 0) {
    const memoryMatches = initialQuestions.filter(
      (q) => q.skill.toLowerCase() === skill.toLowerCase().trim()
    );
    if (memoryMatches.length > 0) {
      questions = memoryMatches;
    } else {
      // Generate standard fallback conceptual questions for any custom skill
      questions = [
        {
          _id: "q1",
          skill: skill,
          question: `Which fundamental principle is most critical when writing production-grade code in ${skill}?`,
          options: [
            "Modular architecture, clean code conventions, and robust error handling",
            "Writing everything in a single global file without functions",
            "Disabling all runtime security validations",
            "Hardcoding database passwords in source files",
          ],
          correctAnswer: 0,
          explanation: "Maintainability, modularity, and error handling are standard best practices across all engineering disciplines.",
          topic: "Architecture & Best Practices",
          difficulty: "Beginner",
        },
        {
          _id: "q2",
          skill: skill,
          question: `How do you measure and optimize performance bottlenecks in a ${skill} application?`,
          options: [
            "Profiling execution times, identifying memory leaks, and applying caching strategies",
            "Deleting log files manually",
            "Increasing font size in the IDE",
            "Restarting the computer after every execution",
          ],
          correctAnswer: 0,
          explanation: "Profiling and caching are standard performance optimization techniques.",
          topic: "Performance & Profiling",
          difficulty: "Intermediate",
        },
        {
          _id: "q3",
          skill: skill,
          question: `What is the best practice for handling asynchronous data operations and state synchronization in ${skill}?`,
          options: [
            "Proper error propagation using structured async/await or promise pipelines with boundary guards",
            "Ignoring all unhandled promise rejections",
            "Blocking the main execution thread indefinitely",
            "Storing credentials in browser session storage",
          ],
          correctAnswer: 0,
          explanation: "Graceful error propagation and non-blocking asynchronous state guards ensure reliability.",
          topic: "Concurrency & Data Flow",
          difficulty: "Advanced",
        },
      ];
    }
  }

  // Sanitize: do not send correctAnswer or explanation to client before submission
  const clientQuestions = questions.map((q, idx) => ({
    id: q._id || `q_${idx}`,
    questionId: q._id || `q_${idx}`,
    skill: q.skill,
    question: q.question,
    options: q.options,
    topic: q.topic || "General",
    difficulty: q.difficulty || "Intermediate",
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        skill,
        totalQuestions: clientQuestions.length,
        passingPercentage: 70,
        questions: clientQuestions,
      },
      "Assessment questions fetched successfully."
    )
  );
});

export const submitAssessment = asyncHandler(async (req, res) => {
  const { skill, userAnswers } = req.body;

  if (!skill || !Array.isArray(userAnswers) || userAnswers.length === 0) {
    throw new ApiError(400, "Please provide valid assessment answers.");
  }

  // Retrieve actual questions with answers
  let dbQuestions = await Question.find({
    skill: { $regex: new RegExp(`^${skill.trim()}$`, "i") },
  });

  if (!dbQuestions || dbQuestions.length === 0) {
    dbQuestions = initialQuestions.filter(
      (q) => q.skill.toLowerCase() === skill.toLowerCase().trim()
    );
  }

  // Build question map
  const questionMap = new Map();
  dbQuestions.forEach((q) => {
    questionMap.set(q._id?.toString() || q.question, q);
  });

  let correctCount = 0;
  const gradedAnswers = [];
  const topicStats = {};
  const difficultyStats = {};

  userAnswers.forEach((ans, index) => {
    // Find matching question
    const qObj =
      questionMap.get(ans.questionId?.toString()) ||
      dbQuestions.find((q) => q.question === ans.question) ||
      dbQuestions[index] ||
      {
        question: ans.question || `Question ${index + 1}`,
        options: ans.options || [],
        correctAnswer: 0,
        explanation: "Standard domain concept.",
        topic: "General",
        difficulty: "Intermediate",
      };

    const isCorrect = ans.selectedAnswer === qObj.correctAnswer;
    if (isCorrect) correctCount++;

    const topic = qObj.topic || "General";
    const difficulty = qObj.difficulty || "Intermediate";

    if (!topicStats[topic]) topicStats[topic] = { correct: 0, total: 0 };
    topicStats[topic].total++;
    if (isCorrect) topicStats[topic].correct++;

    if (!difficultyStats[difficulty]) difficultyStats[difficulty] = { correct: 0, total: 0 };
    difficultyStats[difficulty].total++;
    if (isCorrect) difficultyStats[difficulty].correct++;

    gradedAnswers.push({
      question: qObj.question,
      options: qObj.options,
      selectedAnswer: ans.selectedAnswer,
      correctAnswer: qObj.correctAnswer,
      isCorrect,
      explanation: qObj.explanation || "",
      topic,
      difficulty,
    });
  });

  const totalQuestions = gradedAnswers.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const passed = percentage >= 70;

  // Format performance breakdowns
  const topicPerformance = Object.keys(topicStats).map((topic) => ({
    topic,
    correct: topicStats[topic].correct,
    total: topicStats[topic].total,
    percentage: Math.round((topicStats[topic].correct / topicStats[topic].total) * 100),
  }));

  const difficultyPerformance = Object.keys(difficultyStats).map((difficulty) => ({
    difficulty,
    correct: difficultyStats[difficulty].correct,
    total: difficultyStats[difficulty].total,
    percentage: Math.round((difficultyStats[difficulty].correct / difficultyStats[difficulty].total) * 100),
  }));

  // Update user profile if passed
  const user = await User.findById(req.user._id);
  let updatedSkillStatus = "Claimed";

  if (passed) {
    const existingSkillIndex = user.skillsProficientAt.findIndex(
      (s) => s.name.toLowerCase() === skill.toLowerCase().trim()
    );

    if (existingSkillIndex > -1) {
      const currentSkill = user.skillsProficientAt[existingSkillIndex];
      updatedSkillStatus =
        currentSkill.status === "Verified + Portfolio"
          ? "Verified + Portfolio"
          : "Verified";

      user.skillsProficientAt[existingSkillIndex].status = updatedSkillStatus;
      user.skillsProficientAt[existingSkillIndex].assessmentScore = percentage;
      user.skillsProficientAt[existingSkillIndex].verifiedAt = new Date();
    } else {
      updatedSkillStatus = "Verified";
      user.skillsProficientAt.push({
        name: skill.trim(),
        category: "Other",
        status: "Verified",
        assessmentScore: percentage,
        verifiedAt: new Date(),
      });
    }

    await user.save();

    // Send notification
    await Notification.create({
      recipient: user._id,
      type: "SKILL_VERIFIED",
      title: `Skill Verified: ${skill} ✓`,
      message: `Congratulations! You scored ${percentage}% on the ${skill} assessment and earned the Verified Skill badge.`,
      link: `/profile/${user.username}`,
      metadata: { skill, percentage, passed },
    });
  }

  // Save attempt
  try {
    await AssessmentAttempt.create({
      user: user._id,
      skill,
      score: correctCount,
      totalQuestions,
      percentage,
      passed,
      topicPerformance,
      difficultyPerformance,
      answers: gradedAnswers,
    });
  } catch (err) {
    console.log("Could not record assessment attempt history:", err.message);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        skill,
        score: correctCount,
        incorrect: totalQuestions - correctCount,
        totalQuestions,
        percentage,
        passed,
        updatedSkillStatus,
        topicPerformance,
        difficultyPerformance,
        answers: gradedAnswers,
      },
      passed
        ? `Congratulations! You scored ${percentage}% and verified your ${skill} skill!`
        : `You scored ${percentage}%. 70% is required to verify. Review the answers below and try again!`
    )
  );
});

export const getAssessmentHistory = asyncHandler(async (req, res) => {
  const attempts = await AssessmentAttempt.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  return res
    .status(200)
    .json(new ApiResponse(200, attempts, "Assessment history fetched successfully."));
});
