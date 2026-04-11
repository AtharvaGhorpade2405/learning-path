const User = require('../models/User');

/**
 * Normalize a Date to midnight UTC for day-level comparison.
 */
const toUTCDay = (date) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/**
 * Check if two dates are on the same UTC day.
 */
const isSameDay = (d1, d2) => {
  return toUTCDay(d1).getTime() === toUTCDay(d2).getTime();
};

/**
 * Check if d1 is exactly 1 day before d2 (UTC).
 */
const isYesterday = (d1, d2) => {
  const day1 = toUTCDay(d1).getTime();
  const day2 = toUTCDay(d2).getTime();
  return day2 - day1 === 24 * 60 * 60 * 1000;
};

// @desc    Ping daily activity — updates personal & shared streaks
// @route   POST /api/user/ping-activity
const pingActivity = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const today = new Date();
    const streakEvents = []; // Track streak events for frontend notifications

    // Capture previous date to accurately calculate breaks
    const previousUserLastLessonDate = user.lastLessonCompletedDate;

    // --- Personal Streak Logic ---
    if (previousUserLastLessonDate && isSameDay(previousUserLastLessonDate, today)) {
      // Already completed a lesson today — idempotent for personal streak
      // But still process shared streaks (friend may have completed since last ping)
    } else {
      // First lesson completion of the day
      if (previousUserLastLessonDate && isYesterday(previousUserLastLessonDate, today)) {
        // Consecutive day — increment streak
        user.personalStreak += 1;
      } else {
        // First time or gap > 1 day — reset to 1
        user.personalStreak = 1;
      }
    }

    // Always update these on lesson completion
    user.lastLessonCompletedDate = today;
    user.lastActiveDate = today;

    // --- Shared Streak Logic ---
    const activeFriends = (user.friends || []).filter(
      (f) => f.streakStatus === 'active'
    );

    if (activeFriends.length > 0) {
      const friendIds = activeFriends.map((f) => f.friendId);
      const friendDocs = await User.find({ _id: { $in: friendIds } }).select(
        'lastLessonCompletedDate friends username'
      );

      for (const friendEntry of activeFriends) {
        const friendDoc = friendDocs.find(
          (d) => d._id.toString() === friendEntry.friendId.toString()
        );
        if (!friendDoc) continue;

        // Find the mirror entry on friend's side
        const mirrorEntry = (friendDoc.friends || []).find(
          (f) => f.friendId.toString() === user._id.toString()
        );
        if (!mirrorEntry) continue;

        // --- Check for Breaks ---
        // A streak breaks if established (count > 0) AND EITHER user failed to complete a lesson yesterday.
        // We use previousUserLastLessonDate because we just updated user.lastLessonCompletedDate to 'today'.
        const userCompletedYesterdayOrToday =
          previousUserLastLessonDate &&
          (isSameDay(previousUserLastLessonDate, today) || isYesterday(previousUserLastLessonDate, today));

        const friendCompletedYesterdayOrToday =
          friendDoc.lastLessonCompletedDate &&
          (isSameDay(friendDoc.lastLessonCompletedDate, today) || isYesterday(friendDoc.lastLessonCompletedDate, today));

        if (friendEntry.sharedStreakCount > 0) {
          const userMissed = !userCompletedYesterdayOrToday;
          const friendMissed = !friendCompletedYesterdayOrToday;

          // Only break if someone genuinely missed a day
          if (userMissed || friendMissed) {
            friendEntry.streakStatus = 'inactive';
            friendEntry.sharedStreakCount = 0;
            friendEntry.lastStreakIncrementDate = null;

            mirrorEntry.streakStatus = 'inactive';
            mirrorEntry.sharedStreakCount = 0;
            mirrorEntry.lastStreakIncrementDate = null;

            friendDoc.markModified('friends');
            await friendDoc.save();
            user.markModified('friends');

            streakEvents.push({
              type: 'broken',
              friendUsername: friendDoc.username,
            });
            continue;
          }
        }

        // --- Check for Increments ---
        // Both users must have completed a lesson TODAY
        const friendCompletedToday =
          friendDoc.lastLessonCompletedDate &&
          isSameDay(friendDoc.lastLessonCompletedDate, today);

        const alreadyIncrementedToday =
          friendEntry.lastStreakIncrementDate &&
          isSameDay(friendEntry.lastStreakIncrementDate, today);

        if (friendCompletedToday && !alreadyIncrementedToday) {
          // Both users completed today and haven't incremented yet — increment!
          friendEntry.sharedStreakCount = (friendEntry.sharedStreakCount || 0) + 1;
          friendEntry.lastStreakIncrementDate = today;

          mirrorEntry.sharedStreakCount = (mirrorEntry.sharedStreakCount || 0) + 1;
          mirrorEntry.lastStreakIncrementDate = today;

          friendDoc.markModified('friends');
          await friendDoc.save();
          user.markModified('friends');

          streakEvents.push({
            type: 'incremented',
            friendUsername: friendDoc.username,
            count: friendEntry.sharedStreakCount,
          });
        }
      }
    }

    await user.save();

    res.json({
      personalStreak: user.personalStreak,
      lastActiveDate: user.lastActiveDate,
      lastLessonCompletedDate: user.lastLessonCompletedDate,
      streakEvents,
      message: 'Activity logged!',
    });
  } catch (error) {
    console.error('Ping activity error:', error);
    res.status(500).json({ message: 'Server error logging activity' });
  }
};

module.exports = { pingActivity };
