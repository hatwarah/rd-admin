const express = require('express');
const Video = require('../models/Video');
const { auth } = require('../middleware/auth');
const { videoValidation } = require('../middleware/validation');
const { deleteFromCloudinary } = require('../config/cloudinary');

const router = express.Router();

// @route   GET /api/videos
// @desc    Get all videos
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { category, status, page = 1, limit = 10, search } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const videos = await Video.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Video.countDocuments(query);

    res.json({
      success: true,
      data: {
        videos,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/videos/:id
// @desc    Get single video
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/videos
// @desc    Create video
// @access  Private
router.post('/', auth, videoValidation, async (req, res) => {
  try {
    const videoData = {
      ...req.body,
      createdBy: req.user._id
    };

    const video = new Video(videoData);
    await video.save();

    await video.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/videos/:id
// @desc    Update video
// @access  Private
router.put('/:id', auth, videoValidation, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name email');

    res.json({
      success: true,
      data: updatedVideo
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/videos/:id
// @desc    Delete video
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Delete files from Cloudinary
    try {
      await deleteFromCloudinary(video.thumbnail.publicId);
      await deleteFromCloudinary(video.videoPublicId, 'video');
    } catch (error) {
      console.error('Error deleting files from Cloudinary:', error);
    }

    await Video.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/videos/:id/toggle-featured
// @desc    Toggle featured status
// @access  Private
router.patch('/:id/toggle-featured', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    video.featured = !video.featured;
    video.updatedBy = req.user._id;
    await video.save();

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;