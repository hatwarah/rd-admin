const express = require('express');
const Location = require('../models/Location');
const { auth } = require('../middleware/auth');
const { deleteFromCloudinary } = require('../config/cloudinary');

const router = express.Router();

// @route   GET /api/locations
// @desc    Get all locations
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }

    const locations = await Location.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ order: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Location.countDocuments(query);

    res.json({
      success: true,
      data: {
        locations,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/locations/:id
// @desc    Get single location
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/locations
// @desc    Create location
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const locationData = {
      ...req.body,
      createdBy: req.user._id
    };

    const location = new Location(locationData);
    await location.save();

    await location.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/locations/:id
// @desc    Update location
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    const updatedLocation = await Location.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name email');

    res.json({
      success: true,
      data: updatedLocation
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/locations/:id
// @desc    Delete location
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Delete iconic image from Cloudinary
    try {
      await deleteFromCloudinary(location.iconicImage.publicId);
    } catch (error) {
      console.error('Error deleting iconic image from Cloudinary:', error);
    }

    await Location.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;