const express = require('express');
const Client = require('../models/Client');
const { auth } = require('../middleware/auth');
const { deleteFromCloudinary } = require('../config/cloudinary');

const router = express.Router();

// @route   GET /api/clients
// @desc    Get all clients
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { category, status, page = 1, limit = 10, search } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const clients = await Client.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ order: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Client.countDocuments(query);

    res.json({
      success: true,
      data: {
        clients,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/clients/:id
// @desc    Get single client
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/clients
// @desc    Create client
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      createdBy: req.user._id
    };

    const client = new Client(clientData);
    await client.save();

    await client.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name email');

    res.json({
      success: true,
      data: updatedClient
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/clients/:id
// @desc    Delete client
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Delete logo from Cloudinary
    try {
      await deleteFromCloudinary(client.logo.publicId);
    } catch (error) {
      console.error('Error deleting logo from Cloudinary:', error);
    }

    await Client.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/clients/:id/toggle-featured
// @desc    Toggle featured status
// @access  Private
router.patch('/:id/toggle-featured', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.featured = !client.featured;
    client.updatedBy = req.user._id;
    await client.save();

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;