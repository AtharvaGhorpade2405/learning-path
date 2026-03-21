import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  resources: {
    type: [String],
    default: [],
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const learningPathSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    days: {
      type: Number,
      required: true,
      min: 1,
    },
    steps: [stepSchema],
  },
  { timestamps: true }
);

const LearningPath = mongoose.model('LearningPath', learningPathSchema);
export default LearningPath;
