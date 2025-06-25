const express = require('express');
const Gallery = require('../models/Gallery');
const { auth } = require('../middleware/auth');
const { galleryValidation } = require('../middleware/validation');
const { deleteFromCloudinary } = require('../config/cloudinary');

const router = express.Router();

// @route   GET /api/gallery
// @desc    Get all gallery items
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

    const galleries = await Gallery.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Gallery.countDocuments(query);

    res.json({
      success: true,
      data: {
        galleries,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get galleries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/gallery/:id
// @desc    Get single gallery item
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    res.json({
      success: true,
      data: gallery
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/gallery
// @desc    Create gallery item
// @access  Private
router.post('/', auth, galleryValidation, async (req, res) => {
  try {
    const galleryData = {
      ...req.body,
      createdBy: req.user._id
    };

    const gallery = new Gallery(galleryData);
    await gallery.save();

    await gallery.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: gallery
    });
  } catch (error) {
    console.error('Create gallery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/gallery/:id
// @desc    Update gallery item
// @access  Private
router.put('/:id', auth, galleryValidation, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    const updatedGallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name email');

    res.json({
      success: true,
      data: updatedGallery
    });
  } catch (error) {
    console.error('Update gallery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete gallery item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // Delete images from Cloudinary
    for (const image of gallery.images) {
      try {
        await deleteFromCloudinary(image.publicId);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    await Gallery.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    console.error('Delete gallery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/gallery/:id/toggle-featured
// @desc    Toggle featured status
// @access  Private
router.patch('/:id/toggle-featured', auth, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    gallery.featured = !gallery.featured;
    gallery.updatedBy = req.user._id;
    await gallery.save();

    res.json({
      success: true,
      data: gallery
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;