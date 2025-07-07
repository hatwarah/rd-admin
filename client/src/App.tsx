import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import LoginPage from './pages/Auth/LoginPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import GalleryPage from './pages/Gallery/GalleryPage'
import VideosPage from './pages/Videos/VideosPage'
import BlogsPage from './pages/Blogs/BlogsPage'
import TestimonialsPage from './pages/Testimonials/TestimonialsPage'
import PublicationsPage from './pages/Publications/PublicationsPage'
import ClientsPage from './pages/Clients/ClientsPage'
import LocationsPage from './pages/Locations/LocationsPage'
import LoadingSpinner from './components/UI/LoadingSpinner'

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="videos" element={<VideosPage />} />
        <Route path="blogs" element={<BlogsPage />} />
        <Route path="testimonials" element={<TestimonialsPage />} />
        <Route path="publications" element={<PublicationsPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="locations" element={<LocationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App