const mongoose = require('mongoose');
const RoadmapShare = require('../models/RoadmapShare');
const LearningPath = require('../models/LearningPath');
const User = require('../models/User');

// @desc    Share a roadmap with friends
// @route   POST /api/roadmap/share
const shareRoadmap = async (req, res) => {
  try {
    const { roadmapId, friendIds } = req.body;
    
    if (!roadmapId || !friendIds || !Array.isArray(friendIds)) {
      return res.status(400).json({ message: 'RoadmapId and an array of friendIds are required.' });
    }

    // Verify roadmap exists and belongs to the user
    const roadmap = await LearningPath.findOne({ _id: roadmapId, user: req.user._id });
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found or you do not have permission.' });
    }

    let sentCount = 0;
    
    for (const friendId of friendIds) {
      // Check if they are actually a friend (optional but good for safety)
      const receiver = await User.findById(friendId);
      if (!receiver) continue;

      // Check if a pending request already exists for this exact pair
      const existingShare = await RoadmapShare.findOne({
        senderId: req.user._id,
        receiverId: friendId,
        roadmapId: roadmapId,
        status: 'pending'
      });

      if (!existingShare) {
        await RoadmapShare.create({
          senderId: req.user._id,
          receiverId: friendId,
          roadmapId: roadmapId,
          status: 'pending'
        });
        sentCount++;
      }
    }

    res.json({ message: `Successfully shared roadmap with ${sentCount} friend(s).` });
  } catch (error) {
    console.error('Share roadmap error:', error);
    res.status(500).json({ message: 'Failed to share roadmap.' });
  }
};

// @desc    Get incoming pending roadmap shares
// @route   GET /api/roadmap/shares/pending
const getPendingShares = async (req, res) => {
  try {
    const shares = await RoadmapShare.find({
      receiverId: req.user._id,
      status: 'pending'
    })
      .populate('senderId', 'name username')
      .populate('roadmapId', 'topic days targetNsqfLevel startingNsqfLevel')
      .sort({ createdAt: -1 });

    // Filter out shares where the roadmap might have been deleted by the sender
    const validShares = shares.filter(share => share.roadmapId != null);

    res.json(validShares);
  } catch (error) {
    console.error('Get pending shares error:', error);
    res.status(500).json({ message: 'Failed to fetch pending roadmap requests.' });
  }
};

// @desc    Reject a shared roadmap
// @route   POST /api/roadmap/shares/reject
const rejectShare = async (req, res) => {
  try {
    const { shareId } = req.body;
    
    const share = await RoadmapShare.findOneAndUpdate(
      { _id: shareId, receiverId: req.user._id, status: 'pending' },
      { status: 'rejected' },
      { new: true }
    );

    if (!share) {
      return res.status(404).json({ message: 'Share request not found or already processed.' });
    }

    res.json({ message: 'Roadmap invite declined.' });
  } catch (error) {
    console.error('Reject share error:', error);
    res.status(500).json({ message: 'Failed to reject roadmap.' });
  }
};

// @desc    Accept a shared roadmap and clone it
// @route   POST /api/roadmap/shares/accept
const acceptShare = async (req, res) => {
  try {
    const { shareId } = req.body;
    
    const share = await RoadmapShare.findOne({ 
      _id: shareId, 
      receiverId: req.user._id, 
      status: 'pending' 
    });

    if (!share) {
      return res.status(404).json({ message: 'Share request not found or already processed.' });
    }

    const originalRoadmap = await LearningPath.findById(share.roadmapId);
    if (!originalRoadmap) {
      // The sender deleted the roadmap before it was accepted
      share.status = 'rejected';
      await share.save();
      return res.status(404).json({ message: 'The original roadmap was deleted by the sender.' });
    }

    // CLONING LOGIC
    const deepClone = JSON.parse(JSON.stringify(originalRoadmap));
    
    // Purge specific unique fields from the root
    delete deepClone._id;
    delete deepClone.id;
    delete deepClone.createdAt;
    delete deepClone.updatedAt;
    delete deepClone.__v;
    
    // Rebind owner to receiver
    deepClone.user = req.user._id;

    // Optional: Prefix topic so they know it's a shared clone, or leave as is.
    // Leaving as is to be clean.

    if (deepClone.roadmap && Array.isArray(deepClone.roadmap)) {
      deepClone.roadmap = deepClone.roadmap.map(day => {
        delete day._id;
        delete day.id;

        if (day.lessons && Array.isArray(day.lessons)) {
          day.lessons = day.lessons.map(lesson => {
            delete lesson._id;
            delete lesson.id;
            
            // Force reset progress
            lesson.completed = false;

            if (lesson.resources && Array.isArray(lesson.resources)) {
              lesson.resources = lesson.resources.map(resObj => {
                delete resObj._id;
                delete resObj.id;
                return resObj;
              });
            }
            return lesson;
          });
        }
        return day;
      });
    }

    // Create the clone in the DB
    const newRoadmap = await LearningPath.create(deepClone);

    // Mark share as accepted
    share.status = 'accepted';
    await share.save();

    res.status(201).json({ 
      message: 'Roadmap flawlessly cloned to your dashboard.',
      roadmap: newRoadmap 
    });
  } catch (error) {
    console.error('Accept share error:', error);
    res.status(500).json({ message: 'Failed to accept roadmap.' });
  }
};

module.exports = {
  shareRoadmap,
  getPendingShares,
  rejectShare,
  acceptShare
};
