const User = require('../models/User');

// @desc    Send a friend request by username
// @route   POST /api/social/request
const sendFriendRequest = async (req, res) => {
  try {
    const { username } = req.body;
    const senderId = req.user._id;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Find target user
    const targetUser = await User.findOne({ username: username.toLowerCase() });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Can't add yourself
    if (targetUser._id.toString() === senderId.toString()) {
      return res.status(400).json({ message: "You can't send a friend request to yourself" });
    }

    // Check if already friends
    const alreadyFriends = (targetUser.friends || []).some(
      (f) => f.friendId.toString() === senderId.toString()
    );
    if (alreadyFriends) {
      return res.status(400).json({ message: 'You are already friends with this user' });
    }

    // Check if request already sent
    const alreadyRequested = (targetUser.friendRequests || []).some(
      (id) => id.toString() === senderId.toString()
    );
    if (alreadyRequested) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Check if they already sent you a request
    const theyRequestedYou = (req.user.friendRequests || []).some(
      (id) => id.toString() === targetUser._id.toString()
    );
    if (theyRequestedYou) {
      return res.status(400).json({ message: 'This user already sent you a request! Check your pending requests.' });
    }

    // Push sender's ID into target's friendRequests
    targetUser.friendRequests.push(senderId);
    await targetUser.save();

    res.json({ message: `Friend request sent to @${targetUser.username}` });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error sending friend request' });
  }
};

// @desc    Accept a friend request
// @route   POST /api/social/accept
const acceptFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;
    const currentUser = await User.findById(req.user._id);

    if (!requesterId) {
      return res.status(400).json({ message: 'requesterId is required' });
    }

    // Check the request exists
    const requestIndex = (currentUser.friendRequests || []).findIndex(
      (id) => id.toString() === requesterId
    );
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    const requester = await User.findById(requesterId);
    if (!requester) {
      return res.status(404).json({ message: 'Requester user not found' });
    }

    // Remove from friendRequests
    currentUser.friendRequests.splice(requestIndex, 1);

    // Add to friends for BOTH users with streakStatus = 'inactive'
    currentUser.friends.push({
      friendId: requester._id,
      streakStatus: 'inactive',
      sharedStreakCount: 0,
      lastStreakIncrementDate: null,
    });
    requester.friends.push({
      friendId: currentUser._id,
      streakStatus: 'inactive',
      sharedStreakCount: 0,
      lastStreakIncrementDate: null,
    });

    await currentUser.save();
    await requester.save();

    res.json({ message: `You are now friends with @${requester.username}` });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Server error accepting friend request' });
  }
};

// @desc    Decline a friend request
// @route   POST /api/social/decline
const declineFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;
    const currentUser = await User.findById(req.user._id);

    if (!requesterId) {
      return res.status(400).json({ message: 'requesterId is required' });
    }

    const requestIndex = (currentUser.friendRequests || []).findIndex(
      (id) => id.toString() === requesterId
    );
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    currentUser.friendRequests.splice(requestIndex, 1);
    await currentUser.save();

    res.json({ message: 'Friend request declined' });
  } catch (error) {
    console.error('Decline friend request error:', error);
    res.status(500).json({ message: 'Server error declining friend request' });
  }
};

// @desc    Send a shared streak request to a friend
// @route   POST /api/social/streak/request
const sendStreakRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const currentUser = await User.findById(req.user._id);

    if (!friendId) {
      return res.status(400).json({ message: 'friendId is required' });
    }

    // Find the friend entry on current user's side
    const myEntry = (currentUser.friends || []).find(
      (f) => f.friendId.toString() === friendId
    );
    if (!myEntry) {
      return res.status(404).json({ message: 'This user is not in your friends list' });
    }

    if (myEntry.streakStatus === 'active') {
      return res.status(400).json({ message: 'You already have an active shared streak with this friend' });
    }
    if (myEntry.streakStatus === 'pending_sent') {
      return res.status(400).json({ message: 'Streak request already sent' });
    }
    if (myEntry.streakStatus === 'pending_received') {
      return res.status(400).json({ message: 'This friend already sent you a streak request! Accept it instead.' });
    }

    // Update current user's entry to pending_sent
    myEntry.streakStatus = 'pending_sent';
    myEntry.sharedStreakCount = 0;
    myEntry.lastStreakIncrementDate = null;

    // Update friend's entry to pending_received
    const friendUser = await User.findById(friendId);
    if (!friendUser) {
      return res.status(404).json({ message: 'Friend user not found' });
    }

    const theirEntry = (friendUser.friends || []).find(
      (f) => f.friendId.toString() === currentUser._id.toString()
    );
    if (!theirEntry) {
      return res.status(404).json({ message: 'Friend relationship is broken' });
    }

    theirEntry.streakStatus = 'pending_received';
    theirEntry.sharedStreakCount = 0;
    theirEntry.lastStreakIncrementDate = null;

    await currentUser.save();
    await friendUser.save();

    res.json({ message: 'Shared streak challenge sent! 🔥' });
  } catch (error) {
    console.error('Send streak request error:', error);
    res.status(500).json({ message: 'Server error sending streak request' });
  }
};

// @desc    Accept a shared streak request from a friend
// @route   POST /api/social/streak/accept
const acceptStreakRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const currentUser = await User.findById(req.user._id);

    if (!friendId) {
      return res.status(400).json({ message: 'friendId is required' });
    }

    // Find the friend entry on current user's side
    const myEntry = (currentUser.friends || []).find(
      (f) => f.friendId.toString() === friendId
    );
    if (!myEntry) {
      return res.status(404).json({ message: 'This user is not in your friends list' });
    }

    if (myEntry.streakStatus !== 'pending_received') {
      return res.status(400).json({ message: 'No pending streak request from this friend' });
    }

    // Activate streak on both sides
    myEntry.streakStatus = 'active';
    myEntry.sharedStreakCount = 0;
    myEntry.lastStreakIncrementDate = null;

    const friendUser = await User.findById(friendId);
    if (!friendUser) {
      return res.status(404).json({ message: 'Friend user not found' });
    }

    const theirEntry = (friendUser.friends || []).find(
      (f) => f.friendId.toString() === currentUser._id.toString()
    );
    if (!theirEntry) {
      return res.status(404).json({ message: 'Friend relationship is broken' });
    }

    theirEntry.streakStatus = 'active';
    theirEntry.sharedStreakCount = 0;
    theirEntry.lastStreakIncrementDate = null;

    await currentUser.save();
    await friendUser.save();

    res.json({ message: 'Shared streak activated! Both of you need to complete a lesson every day. 🔥' });
  } catch (error) {
    console.error('Accept streak request error:', error);
    res.status(500).json({ message: 'Server error accepting streak request' });
  }
};

// @desc    Get friends list + pending requests
// @route   GET /api/social/friends
const getFriends = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id)
      .populate('friendRequests', 'name username personalStreak lastActiveDate lastLessonCompletedDate')
      .lean();

    // Populate friends manually since it's a subdocument array
    const userFriends = currentUser.friends || [];
    const friendIds = userFriends.map((f) => f.friendId);
    const friendDocs = await User.find({ _id: { $in: friendIds } })
      .select('name username personalStreak lastActiveDate lastLessonCompletedDate')
      .lean();

    // Merge friend data with streak info
    const friends = userFriends.map((f) => {
      const doc = friendDocs.find(
        (d) => d._id.toString() === f.friendId.toString()
      );
      return {
        _id: doc?._id,
        name: doc?.name,
        username: doc?.username,
        personalStreak: doc?.personalStreak || 0,
        lastActiveDate: doc?.lastActiveDate || null,
        lastLessonCompletedDate: doc?.lastLessonCompletedDate || null,
        streakStatus: f.streakStatus || 'inactive',
        sharedStreakCount: f.sharedStreakCount || 0,
        lastStreakIncrementDate: f.lastStreakIncrementDate || null,
      };
    });

    // Sort by personalStreak descending (leaderboard)
    friends.sort((a, b) => b.personalStreak - a.personalStreak);

    res.json({
      friends,
      pendingRequests: currentUser.friendRequests || [],
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error fetching friends' });
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  sendStreakRequest,
  acceptStreakRequest,
  getFriends,
};
