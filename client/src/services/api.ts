import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
}

// Gallery API
export const galleryAPI = {
  getAll: (params?: any) => api.get('/gallery', { params }),
  getById: (id: string) => api.get(`/gallery/${id}`),
  create: (data: any) => api.post('/gallery', data),
  update: (id: string, data: any) => api.put(`/gallery/${id}`, data),
  delete: (id: string) => api.delete(`/gallery/${id}`),
  toggleFeatured: (id: string) => api.patch(`/gallery/${id}/toggle-featured`),
}

// Videos API
export const videosAPI = {
  getAll: (params?: any) => api.get('/videos', { params }),
  getById: (id: string) => api.get(`/videos/${id}`),
  create: (data: any) => api.post('/videos', data),
  update: (id: string, data: any) => api.put(`/videos/${id}`, data),
  delete: (id: string) => api.delete(`/videos/${id}`),
  toggleFeatured: (id: string) => api.patch(`/videos/${id}/toggle-featured`),
}

// Blogs API
export const blogsAPI = {
  getAll: (params?: any) => api.get('/blogs', { params }),
  getById: (id: string) => api.get(`/blogs/${id}`),
  create: (data: any) => api.post('/blogs', data),
  update: (id: string, data: any) => api.put(`/blogs/${id}`, data),
  delete: (id: string) => api.delete(`/blogs/${id}`),
  toggleFeatured: (id: string) => api.patch(`/blogs/${id}/toggle-featured`),
}

// Testimonials API
export const testimonialsAPI = {
  getAll: (params?: any) => api.get('/testimonials', { params }),
  getById: (id: string) => api.get(`/testimonials/${id}`),
  create: (data: any) => api.post('/testimonials', data),
  update: (id: string, data: any) => api.put(`/testimonials/${id}`, data),
  delete: (id: string) => api.delete(`/testimonials/${id}`),
  toggleFeatured: (id: string) => api.patch(`/testimonials/${id}/toggle-featured`),
}

// Publications API
export const publicationsAPI = {
  getAll: (params?: any) => api.get('/publications', { params }),
  getById: (id: string) => api.get(`/publications/${id}`),
  create: (data: any) => api.post('/publications', data),
  update: (id: string, data: any) => api.put(`/publications/${id}`, data),
  delete: (id: string) => api.delete(`/publications/${id}`),
  toggleFeatured: (id: string) => api.patch(`/publications/${id}/toggle-featured`),
}

// Clients API
export const clientsAPI = {
  getAll: (params?: any) => api.get('/clients', { params }),
  getById: (id: string) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
  toggleFeatured: (id: string) => api.patch(`/clients/${id}/toggle-featured`),
}

// Locations API
export const locationsAPI = {
  getAll: (params?: any) => api.get('/locations', { params }),
  getById: (id: string) => api.get(`/locations/${id}`),
  create: (data: any) => api.post('/locations', data),
  update: (id: string, data: any) => api.put(`/locations/${id}`, data),
  delete: (id: string) => api.delete(`/locations/${id}`),
}

// Upload API
export const uploadAPI = {
  uploadImages: (formData: FormData) =>
    api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadVideo: (formData: FormData) =>
    api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadThumbnail: (formData: FormData) =>
    api.post('/upload/thumbnail', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadBlogImage: (formData: FormData) =>
    api.post('/upload/blog-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadAuthorImage: (formData: FormData) =>
    api.post('/upload/author-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadTestimonialAvatar: (formData: FormData) =>
    api.post('/upload/testimonial-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadPublicationImage: (formData: FormData) =>
    api.post('/upload/publication-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadClientLogo: (formData: FormData) =>
    api.post('/upload/client-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadLocationImage: (formData: FormData) =>
    api.post('/upload/location-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export default api