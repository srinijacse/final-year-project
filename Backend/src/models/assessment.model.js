import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema(
  {
    skill: {
      type: String,
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: [
      {
        type: String,
        required: true,
      },
    ],
    correctAnswer: {
      type: Number,
      required: true, // index 0-3
    },
    explanation: {
      type: String,
      default: "",
    },
    topic: {
      type: String,
      default: "General",
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
  },
  { timestamps: true }
);

const assessmentAttemptSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    skill: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    topicPerformance: [
      {
        topic: String,
        correct: Number,
        total: Number,
        percentage: Number,
      },
    ],
    difficultyPerformance: [
      {
        difficulty: String,
        correct: Number,
        total: Number,
        percentage: Number,
      },
    ],
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: "Question" },
        question: String,
        options: [String],
        selectedAnswer: Number,
        correctAnswer: Number,
        isCorrect: Boolean,
        explanation: String,
        topic: String,
        difficulty: String,
      },
    ],
  },
  { timestamps: true }
);

export const Question = mongoose.model("Question", questionSchema);
export const AssessmentAttempt = mongoose.model(
  "AssessmentAttempt",
  assessmentAttemptSchema
);
