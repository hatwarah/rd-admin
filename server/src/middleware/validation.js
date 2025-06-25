const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const galleryValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Residential', 'Commercial', 'Mixed-Use', 'Institutional', 'Miscellaneous'])
    .withMessage('Invalid category'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  handleValidationErrors
];

const videoValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Residential', 'Commercial', 'Mixed-Use', 'Institutional', 'Walkthrough', 'Animation'])
    .withMessage('Invalid category'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  handleValidationErrors
];

const blogValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 300 })
    .withMessage('Title cannot exceed 300 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required'),
  body('excerpt')
    .trim()
    .notEmpty()
    .withMessage('Excerpt is required')
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot exceed 500 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Technology', 'Architecture', 'Design', 'Craftsmanship', 'Industry', 'Tips'])
    .withMessage('Invalid category'),
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required'),
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

module.exports = {
  galleryValidation,
  videoValidation,
  blogValidation,
  loginValidation,
  handleValidationErrors
};