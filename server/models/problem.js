import mongoose from "mongoose";

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, required: true, trim: true },
    output: { type: String, required: true, trim: true },
    explanation: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const hiddenTestCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true, trim: true },
    output: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    input_format: {
      type: String,
      required: true,
      trim: true,
    },
    output_format: {
      type: String,
      required: true,
      trim: true,
    },
    constraints: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    examples: {
      type: [exampleSchema],
      validate: {
        validator: (examples) => examples.length > 0,
        message: "At least one example is required",
      },
    },
    hidden_test_cases: {
      type: [hiddenTestCaseSchema],
      validate: {
        validator: (testCases) => testCases.length > 0,
        message: "At least one hidden test case is required",
      },
    },
    time_limit: {
      type: Number,
      default: 1,
      min: 1,
    },
    memory_limit: {
      type: Number,
      default: 256,
      min: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Problem", problemSchema);
