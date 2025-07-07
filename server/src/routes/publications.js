const express = require('express');
const Publication = require('../models/Publication');
const { auth } = require('../middleware/auth');
const { deleteFromCloudinary } = require('../config/cloudinary');

const router = express.Router();

// @route   GET /api/publications
// @desc    Get all publications
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
        { description: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } }
      ];
    }

    const publications = await Publication.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ order: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Publication.countDocuments(query);

    res.json({
      success: true,
      data: {
        publications,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get publications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/publications/:id
// @desc    Get single publication
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }

    res.json({
      success: true,
      data: publication
    });
  } catch (error) {
    console.error('Get publication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/publications
// @desc    Create publication
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const publicationData = {
      ...req.body,
      createdBy: req.user._id
    };

    const publication = new Publication(publicationData);
    await publication.save();

    await publication.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: publication
    });
  } catch (error) {
    console.error('Create publication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/publications/:id
// @desc    Update publication
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id);

    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }

    const updatedPublication = await Publication.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name email');

    res.json({
      success: true,
      data: updatedPublication
    });
  } catch (error) {
    console.error('Update publication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/publications/:id
// @desc    Delete publication
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id);

    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }

    // Delete image from Cloudinary
    try {
      await deleteFromCloudinary(publication.image.publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
    }

    await Publication.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Publication deleted successfully'
    });
  } catch (error) {
    console.error('Delete publication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/publications/:id/toggle-featured
// @desc    Toggle featured status
// @access  Private
router.patch('/:id/toggle-featured', auth, async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id);

    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }

    publication.featured = !publication.featured;
    publication.updatedBy = req.user._id;
    await publication.save();

    res.json({
      success: true,
      data: publication
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;