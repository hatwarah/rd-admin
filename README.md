# RD Admin - MERN Stack CMS

A comprehensive Content Management System built with the MERN stack for managing gallery images, videos, and blog posts with Cloudinary integration.

## Features

### 🎨 Frontend (React + TypeScript)
- **Modern Dashboard**: Clean, responsive interface with sidebar navigation
- **Gallery Management**: Upload, organize, and manage image galleries with categories
- **Video Management**: Upload videos with thumbnails and metadata
- **Blog Management**: Rich text editor for creating and managing blog posts
- **Drag & Drop Upload**: Intuitive file upload with progress indicators
- **Real-time Updates**: React Query for efficient data fetching and caching
- **Form Validation**: Comprehensive validation with error handling
- **Responsive Design**: Mobile-first design that works on all devices

### 🚀 Backend (Node.js + Express)
- **RESTful API**: Complete CRUD operations for all content types
- **MongoDB Integration**: Robust data models with Mongoose
- **JWT Authentication**: Secure token-based authentication
- **File Upload**: Multer integration for handling file uploads
- **Cloudinary Integration**: Organized cloud storage with automatic optimization
- **Input Validation**: Express-validator for request validation
- **Error Handling**: Comprehensive error handling middleware
- **Security**: Helmet, CORS, and rate limiting

### ☁️ Cloudinary Integration
- **Organized Storage**: Automatic folder structure based on content type
- **Image Optimization**: Automatic format conversion and quality optimization
- **Video Support**: Video upload and streaming capabilities
- **Batch Operations**: Support for multiple file uploads

## Project Structure

```
rd-admin/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── config/        # Configuration files
│   │   └── server.js      # Main server file
│   ├── scripts/           # Utility scripts
│   └── package.json
└── package.json           # Root package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Cloudinary account

### 1. Clone the repository
```bash
git clone <repository-url>
cd rd-admin
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
npm run install-server

# Install client dependencies
npm run install-client
```

### 3. Environment Configuration

Update the `server/.env` file with your credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your-mongodb-connection-string

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Admin User
ADMIN_EMAIL=admin@rdmodels.com
ADMIN_PASSWORD=admin123

# CORS Origin
CORS_ORIGIN=http://localhost:5173
```

### 4. Create Admin User
```bash
cd server
node scripts/createAdmin.js
```

### 5. Start the application
```bash
# Development mode (runs both client and server)
npm run dev

# Or run separately
npm run server  # Backend only
npm run client  # Frontend only
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Gallery
- `GET /api/gallery` - Get all gallery items
- `GET /api/gallery/:id` - Get single gallery item
- `POST /api/gallery` - Create gallery item
- `PUT /api/gallery/:id` - Update gallery item
- `DELETE /api/gallery/:id` - Delete gallery item
- `PATCH /api/gallery/:id/toggle-featured` - Toggle featured status

### Videos
- `GET /api/videos` - Get all videos
- `GET /api/videos/:id` - Get single video
- `POST /api/videos` - Create video
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video
- `PATCH /api/videos/:id/toggle-featured` - Toggle featured status

### Blogs
- `GET /api/blogs` - Get all blog posts
- `GET /api/blogs/:id` - Get single blog post
- `POST /api/blogs` - Create blog post
- `PUT /api/blogs/:id` - Update blog post
- `DELETE /api/blogs/:id` - Delete blog post
- `PATCH /api/blogs/:id/toggle-featured` - Toggle featured status

### File Upload
- `POST /api/upload/images` - Upload multiple images
- `POST /api/upload/video` - Upload single video
- `POST /api/upload/thumbnail` - Upload video thumbnail
- `POST /api/upload/blog-image` - Upload blog featured image
- `POST /api/upload/author-image` - Upload author image

## Cloudinary Folder Structure

The system automatically organizes files in Cloudinary:

```
rd-models/
├── gallery/
│   ├── Residential/
│   │   └── project-name/
│   ├── Commercial/
│   └── Mixed-Use/
├── videos/
│   ├── Residential/
│   ├── Commercial/
│   └── Animation/
└── blog/
    ├── images/
    └── author-images/
```

## Data Models

### Gallery
- Title, category, description
- Multiple images with captions
- Location, client information
- Tags, featured status
- View count, creation metadata

### Video
- Title, category, description
- Video file and thumbnail
- Duration, resolution
- Location, client information
- Tags, featured status
- View count, likes

### Blog
- Title, content, excerpt
- Author information with image
- Featured image
- Category, tags
- SEO metadata
- Publication status
- Read time, view count

## Technologies Used

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **React Router** - Routing
- **React Hook Form** - Form handling
- **React Dropzone** - File uploads
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **Cloudinary** - Cloud storage
- **Bcrypt** - Password hashing

## Development Scripts

```bash
# Root level
npm run dev          # Run both client and server
npm run server       # Run server only
npm run client       # Run client only
npm run build        # Build client for production
npm run install-all  # Install all dependencies

# Server level
npm run start        # Production server
npm run dev          # Development server

# Client level
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

## Production Deployment

### Build the client
```bash
cd client
npm run build
```

### Environment Variables
Ensure all production environment variables are set:
- `NODE_ENV=production`
- `MONGODB_URI` (production database)
- `JWT_SECRET` (strong secret key)
- Cloudinary credentials
- `CORS_ORIGIN` (production frontend URL)

### Security Considerations
- Change default admin credentials
- Use strong JWT secret
- Enable HTTPS in production
- Configure proper CORS origins
- Set up rate limiting
- Regular security updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.