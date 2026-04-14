const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    careerProfile: {
      rawBackgroundText: { type: String, default: '' },
      parsedExperience: { type: [String], default: [] },
      baseNsqfScore: { type: Number, min: 1, max: 10, default: null },
      nsqfJustification: { type: String, default: '' },
      lastAnalyzedAt: { type: Date, default: null },
    },
    personalStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    lastLessonCompletedDate: { type: Date, default: null },
    totalXP: { type: Number, default: 0 },
    currentLevel: { type: Number, default: 1 },
    friendRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ],
    friends: [
      {
        friendId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        streakStatus: {
          type: String,
          enum: ['inactive', 'pending_sent', 'pending_received', 'active'],
          default: 'inactive',
        },
        sharedStreakCount: { type: Number, default: 0 },
        lastStreakIncrementDate: { type: Date, default: null },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
