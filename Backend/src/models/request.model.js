import mongoose, { Schema } from "mongoose";

const requestSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    message: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

requestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export const Request = mongoose.model("Request", requestSchema);
