const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  quote: {
    type: String,
    required: [true, 'Quote is required'],
    trim: true,
    maxlength: [2000, 'Quote cannot exceed 2000 characters']
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [200, 'Author name cannot exceed 200 characters']
  },
  position: {
    type: String,
    trim: true,
    maxlength: [300, 'Position cannot exceed 300 characters']
  },
  avatar: {
    url: {
      type: String,
      required: [true, 'Avatar image is required']
    },
    publicId: {
      type: String,
      required: true
    }
  },
  company: {
    type: String,
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  order: {
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
testimonialSchema.index({ status: 1, order: 1 });
testimonialSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);