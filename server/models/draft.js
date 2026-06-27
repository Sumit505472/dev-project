import mongoose from "mongoose";

const draftSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
      index: true,
    },
    language: {
      type: String,
      enum: ["cpp", "c", "python"],
      required: true,
    },
    code: {
      type: String,
      required: true,
      default: "",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

draftSchema.index(
  { userId: 1, problemId: 1, language: 1 },
  { unique: true }
);

export default mongoose.model("Draft", draftSchema);
