import mongoose, { Schema } from "mongoose";

const ratingSchema = new Schema(
  {
    session: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      default: null,
    },
    rater: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      index: true,
    },
    skill: {
      type: String,
      default: "General",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Rating = mongoose.model("Rating", ratingSchema);
