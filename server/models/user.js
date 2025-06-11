import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  token: {
    type: String
  },
  submissions: [
    {
      problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
      },
      status: {
        type: String,
        enum: ['Accepted', 'Wrong Answer', 'Compilation Error', 'Time Limit Exceeded'],
        required: true
      },
      language: {
        type: String,
        required: true
      },
      submittedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
