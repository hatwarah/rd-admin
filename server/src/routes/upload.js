const express = require('express');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { uploadToCloudinary, batchUploadToCloudinary } = require('../config/cloudinary');
const Gallery = require('../models/Gallery');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files at once
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.fieldname === 'images') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for images field'), false);
      }
    } else if (file.fieldname === 'video') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed for video field'), false);
      }
    } else {
      cb(null, true);
    }
  }
});

// @route   POST /api/upload/images
// @desc    Upload multiple images
// @access  Private
router.post('/images', auth, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const { type, category, projectName, description='' } = req.body;

    const uploadPromises = req.files.map(file => {
      return uploadToCloudinary(file.buffer, {
        type,
        category,
        title: file.originalname,
        projectName,
        resourceType: 'image'
      });
    });
    console.log(uploadPromises)

    const results = await Promise.all(uploadPromises);

    const uploadedImages = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      order: 0
    }));

    // Save to database
    const galleryItem = new Gallery({
      title: projectName || req.file.originalname.split('.')[0], // Use provided title or filename without extension
      category: category || 'Miscellaneous',
      description: description || 'Uploaded via blog',
      images: uploadedImages,
      createdBy: req.user._id
    });

    await galleryItem.save();
    
    res.json({
      success: true,
      data: uploadedImages
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload images' });
  }
});

// @route   POST /api/upload/video
// @desc    Upload single video
// @access  Private
router.post('/video', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const { category } = req.body;

    const result = await uploadToCloudinary(req.file.buffer, {
      type: 'video',
      category,
      title: req.file.originalname,
      resourceType: 'video'
    });

    const uploadedVideo = {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };

    res.json({
      success: true,
      data: uploadedVideo
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload video' });
  }
});

// @route   POST /api/upload/thumbnail
// @desc    Upload video thumbnail
// @access  Private
router.post('/thumbnail', auth, upload.single('thumbnail'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No thumbnail file uploaded' });
    }

    const { category } = req.body;

    const result = await uploadToCloudinary(req.file.buffer, {
      type: 'video',
      category,
      title: req.file.originalname,
      resourceType: 'image'
    });

    const uploadedThumbnail = {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };

    res.json({
      success: true,
      data: uploadedThumbnail
    });
  } catch (error) {
    console.error('Thumbnail upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload thumbnail' });
  }
});

// @route   POST /api/upload/blog-image
// @desc    Upload blog featured image
// @access  Private
router.post('/blog-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const { title, category, description } = req.body;
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      type: 'blog',
      title: req.file.originalname,
      resourceType: 'image'
    });

    // Prepare image data
    const uploadedImage = {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };

    // Save to database
    const galleryItem = new Gallery({
      title: title || req.file.originalname.split('.')[0], // Use provided title or filename without extension
      category: category || 'Miscellaneous',
      description: description || 'Uploaded via blog',
      images: [uploadedImage]
    });

    await galleryItem.save();

    res.json({
      success: true,
      message: 'Image uploaded and saved successfully',
      data: {
        ...uploadedImage,
        galleryId: galleryItem._id
      }
    });
  } catch (error) {
    console.error('Blog image upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload blog image' });
  }
});

// @route   POST /api/upload/author-image
// @desc    Upload author image
// @access  Private
router.post('/author-image', auth, upload.single('authorImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No author image file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      type: 'blog-author',
      title: req.file.originalname,
      resourceType: 'image'
    });

    const uploadedImage = {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };

    res.json({
      success: true,
      data: uploadedImage
    });
  } catch (error) {
    console.error('Author image upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload author image' });
  }
});

module.exports = router;