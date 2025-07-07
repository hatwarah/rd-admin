const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [200, 'Client name cannot exceed 200 characters']
  },
  logo: {
    url: {
      type: String,
      required: [true, 'Logo is required']
    },
    publicId: {
      type: String,
      required: true
    }
  },
  category: {
    type: String,
    enum: ['Real Estate', 'Government', 'Corporate', 'Educational', 'Healthcare', 'Industrial', 'Other'],
    default: 'Real Estate'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  website: {
    type: String,
    trim: true
  },
  projectsCompleted: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
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
clientSchema.index({ category: 1, status: 1 });
clientSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Client', clientSchema);