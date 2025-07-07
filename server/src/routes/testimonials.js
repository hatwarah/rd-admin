const express = require('express');
const Testimonial = require('../models/Testimonial');
const { auth } = require('../middleware/auth');
const { deleteFromCloudinary } = require('../config/cloudinary');

const router = express.Router();

// @route   GET /api/testimonials
// @desc    Get all testimonials
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { author: { $regex: search, $options: 'i' } },
        { quote: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const testimonials = await Testimonial.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ order: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Testimonial.countDocuments(query);

    res.json({
      success: true,
      data: {
        testimonials,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/testimonials/:id
// @desc    Get single testimonial
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error('Get testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/testimonials
// @desc    Create testimonial
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const testimonialData = {
      ...req.body,
      createdBy: req.user._id
    };

    const testimonial = new Testimonial(testimonialData);
    await testimonial.save();

    await testimonial.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/testimonials/:id
// @desc    Update testimonial
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name email');

    res.json({
      success: true,
      data: updatedTestimonial
    });
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/testimonials/:id
// @desc    Delete testimonial
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // Delete avatar from Cloudinary
    try {
      await deleteFromCloudinary(testimonial.avatar.publicId);
    } catch (error) {
      console.error('Error deleting avatar from Cloudinary:', error);
    }

    await Testimonial.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/testimonials/:id/toggle-featured
// @desc    Toggle featured status
// @access  Private
router.patch('/:id/toggle-featured', auth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    testimonial.featured = !testimonial.featured;
    testimonial.updatedBy = req.user._id;
    await testimonial.save();

    res.json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;