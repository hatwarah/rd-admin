const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      "All",
      "High Rise Residential",
      "Low Rise Residential",
      "Villa Township",
      "Landscape + Resort",
      "Interior Units",
      "House Models",
      "Commercial Models",
      "Institutional Models",
      "Villa Unit Models",
      "Industrial / Factory Models",
      "Healthcare Hospital Models",
      "Water supply Models",
      "Residential Township",
      "Industrial Township",
      "Monochromatic Models",
      "Art Models",
      "Sectional Models",
      "Monuments",
      "Miscellaneous",
    ],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      trim: true
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  client: {
    type: String,
    trim: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
gallerySchema.index({ category: 1, status: 1 });
gallerySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Gallery', gallerySchema);