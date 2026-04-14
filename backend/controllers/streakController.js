const User = require('../models/User');
const { processXP } = require('../utils/ranks');

/**
 * Normalize a Date to midnight UTC for day-level comparison.
 */
const normalizeToMidnight = (date) => {
  if (!date) return null;
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
};

// @desc    Ping daily activity — updates personal & shared streaks
// @route   POST /api/user/ping-activity
const pingActivity = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const now = new Date();
    const todayMidnight = normalizeToMidnight(now);
    const yesterdayMidnight = todayMidnight - 24 * 60 * 60 * 1000;

    const streakEvents = [];
    let xpAwarded = 0;
    let levelUp = false;
    let newRankName = null;

    // Check if it's the first login today based on lastActiveDate
    const userLastActive = normalizeToMidnight(user.lastActiveDate);
    if (userLastActive !== todayMidnight) {
       const xpResult = processXP(user, 10);
       xpAwarded = 10;
       levelUp = xpResult.levelUp;
       newRankName = xpResult.newRankName;
    }

    const userLastLesson = normalizeToMidnight(user.lastLessonCompletedDate);

    // --- Personal Streak Logic ---
    if (userLastLesson === todayMidnight) {
      // Check 1: Already completed a lesson today. DO NOT increment, DO NOT break.
    } else if (userLastLesson === yesterdayMidnight) {
      // Check 2: Consecutive day completed
      user.personalStreak += 1;
    } else {
      // Check 3: Missed a day or first time
      user.personalStreak = 1;
    }

    user.lastLessonCompletedDate = now;
    user.lastActiveDate = now;

    // --- Shared Streak Logic ---
    const activeFriends = (user.friends || []).filter(
      (f) => f.streakStatus === 'active'
    );

    if (activeFriends.length > 0) {
      const friendIds = activeFriends.map((f) => f.friendId);
      const friendDocs = await User.find({ _id: { $in: friendIds } }).select(
        'lastLessonCompletedDate friends username'
      );

      const promises = [];

      for (const friendEntry of activeFriends) {
        const friendDoc = friendDocs.find(
          (d) => d._id.toString() === friendEntry.friendId.toString()
        );
        if (!friendDoc) continue;

        const mirrorEntry = (friendDoc.friends || []).find(
          (f) => f.friendId.toString() === user._id.toString()
        );
        if (!mirrorEntry) continue;

        const friendLastLesson = normalizeToMidnight(friendDoc.lastLessonCompletedDate);
        const lastStreakIncrement = normalizeToMidnight(friendEntry.lastStreakIncrementDate);

        // Check 1 (Already incremented today)
        if (lastStreakIncrement === todayMidnight) {
          continue; // The streak was already updated today.
        }

        // Check 2 (Break Condition)
        if (friendLastLesson === null || friendLastLesson < yesterdayMidnight) {
          friendEntry.streakStatus = 'inactive';
          friendEntry.sharedStreakCount = 0;
          friendEntry.lastStreakIncrementDate = null;

          mirrorEntry.streakStatus = 'inactive';
          mirrorEntry.sharedStreakCount = 0;
          mirrorEntry.lastStreakIncrementDate = null;

          friendDoc.markModified('friends');
          promises.push(friendDoc.save());

          streakEvents.push({
            type: 'broken',
            friendUsername: friendDoc.username,
          });
          continue;
        }

        // Check 3 (Increment Condition)
        if (friendLastLesson === todayMidnight) {
          friendEntry.sharedStreakCount = (friendEntry.sharedStreakCount || 0) + 1;
          friendEntry.lastStreakIncrementDate = now;

          mirrorEntry.sharedStreakCount = (mirrorEntry.sharedStreakCount || 0) + 1;
          mirrorEntry.lastStreakIncrementDate = now;

          friendDoc.markModified('friends');
          promises.push(friendDoc.save());

          streakEvents.push({
            type: 'incremented',
            friendUsername: friendDoc.username,
            count: friendEntry.sharedStreakCount,
          });
        }
      }

      user.markModified('friends');
      await Promise.all(promises);
    }

    await user.save();

    res.json({
      personalStreak: user.personalStreak,
      lastActiveDate: user.lastActiveDate,
      lastLessonCompletedDate: user.lastLessonCompletedDate,
      streakEvents,
      xpAwarded,
      levelUp,
      newRankName,
      totalXP: user.totalXP,
      currentLevel: user.currentLevel,
      message: 'Activity logged!',
    });
  } catch (error) {
    console.error('Ping activity error:', error);
    res.status(500).json({ message: 'Server error logging activity' });
  }
};

module.exports = { pingActivity };
