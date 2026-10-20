import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    learner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skill: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 60, // in minutes
    },
    meetingLink: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Requested", "Accepted", "Rejected", "Completed", "Cancelled"],
      default: "Requested",
    },
    completedAt: {
      type: Date,
      default: null,
    },
    isReviewedByLearner: {
      type: Boolean,
      default: false,
    },
    isReviewedByTeacher: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Session = mongoose.model("Session", sessionSchema);
