const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
});

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  resources: [resourceSchema],
  completed: {
    type: Boolean,
    default: false,
  },
});

const daySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  lessons: [lessonSchema],
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
    currentKnowledge: {
      type: String,
      required: true,
      trim: true,
    },
    days: {
      type: Number,
      required: true,
      min: 1,
    },
    roadmap: [daySchema],
    startingNsqfLevel: { type: Number, min: 1, max: 10, default: null },
    targetNsqfLevel: { type: Number, min: 1, max: 10, default: null },
    skillNsqfLevel: { type: Number, min: 1, max: 10, default: null },
  },

  { timestamps: true }
);

const LearningPath = mongoose.model('LearningPath', learningPathSchema);
module.exports = LearningPath;
