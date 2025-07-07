const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters']
  },
  image: {
    url: {
      type: String,
      required: [true, 'Image is required']
    },
    publicId: {
      type: String,
      required: true
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Press Release', 'Magazine', 'Newspaper', 'Online Article', 'Award', 'Certificate'],
    default: 'Press Release'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  publishedDate: {
    type: Date
  },
  source: {
    type: String,
    trim: true,
    maxlength: [200, 'Source cannot exceed 200 characters']
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
publicationSchema.index({ category: 1, status: 1 });
publicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Publication', publicationSchema);