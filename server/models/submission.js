import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ['cpp', 'c', 'java', 'python'], // your supported languages
  },
  verdict: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Compilation Error', 'Time Limit Exceeded', 'Error'], // you can add more if needed
  },
  status: {
    type: String,
    enum: ['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED'],
    default: 'COMPLETED',
  },
  results: [
    {
      input: String,
      expected: String,
      actual: String,
      passed: Boolean,
    },
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
