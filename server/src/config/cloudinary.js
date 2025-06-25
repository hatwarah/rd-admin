const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to get folder path based on type and category
const getFolderPath = (type, category, projectName = null) => {
  switch (type) {
    case 'gallery':
      return projectName 
        ? `rd-models/gallery/${category}/${projectName}`
        : `rd-models/gallery/${category}`;
    case 'video':
      return `rd-models/videos/${category}`;
    case 'blog':
      return 'rd-models/blog/images';
    case 'blog-author':
      return 'rd-models/blog/author-images';
    default:
      return 'rd-models/misc';
  }
};

// Upload function with automatic folder organization
const uploadToCloudinary = async (file, options = {}) => {
  try {
    const { type, category, projectName, resourceType = 'image' } = options;
    
    const folderPath = getFolderPath(type, category, projectName);
    
    const uploadOptions = {
      folder: folderPath,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
    };

    // Add transformation for images
    if (resourceType === 'image') {
      uploadOptions.transformation = [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 1920, height: 1080, crop: 'limit' }
      ];
    }

    const result = await cloudinary.uploader.upload(file, uploadOptions);
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

// Delete function
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

// Batch upload function
const batchUploadToCloudinary = async (files, options = {}) => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file, options));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Batch upload error:', error);
    throw new Error('Failed to upload files to Cloudinary');
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  batchUploadToCloudinary,
  getFolderPath
};