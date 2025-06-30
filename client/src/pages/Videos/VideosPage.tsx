import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Edit, Trash2, Star, StarOff, Play } from 'lucide-react'
import toast from 'react-hot-toast'
import { videosAPI } from '../../services/api'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import VideoForm from './VideoForm'

const VideosPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState('')

  const queryClient = useQueryClient()

  interface ApiResponse {
    data: {
      videos: any[];
      totalPages: number;
      currentPage: number;
      total: number;
    };
  }

  const { data, isLoading } = useQuery<ApiResponse>(
    ['videos', selectedCategory],
    () => videosAPI.getAll({ category: selectedCategory || undefined }),
    {
      onSuccess: (data) => {
        console.log('API Response:', data);
      },
      onError: (error) => {
        console.error('Error fetching videos:', error);
      }
    }
  )

  const deleteMutation = useMutation(videosAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('videos')
      toast.success('Video deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete video')
    }
  })

  const toggleFeaturedMutation = useMutation(videosAPI.toggleFeatured, {
    onSuccess: () => {
      queryClient.invalidateQueries('videos')
      toast.success('Featured status updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update featured status')
    }
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleToggleFeatured = (id: string) => {
    toggleFeaturedMutation.mutate(id)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const categories = ['Residential', 'Commercial', 'Mixed-Use', 'Institutional', 'Walkthrough', 'Animation']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Management</h1>
          <p className="text-gray-600">Manage your video content</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} style={{
            backgroundColor: "black",
            color: 'white'
          }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Video
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data?.data?.videos?.map((video: any) => (
            <div key={video._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="aspect-video bg-gray-200 relative overflow-hidden group">
                {video.thumbnail?.url ? (
                  <>
                    <img
                      src={video.thumbnail.url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Thumbnail
                  </div>
                )}
                {video.featured && (
                  <div className="absolute top-2 right-2 bg-warning-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Featured
                  </div>
                )}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    {parseFloat(video.duration).toFixed(2)}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {video.title}
                  </h3>
                  <span className="text-xs bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full">
                    {video.category}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {video.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{video.viewCount || 0} views</span>
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFeatured(video._id)}
                    disabled={toggleFeaturedMutation.isLoading}
                  >
                    {video.featured ? (
                      <Star className="w-4 h-4 text-warning-500 fill-current" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(video)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(video._id)}
                    disabled={deleteMutation.isLoading}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Video' : 'Add Video'}
        size="xl"
      >
        <VideoForm
          item={editingItem}
          onSuccess={() => {
            handleCloseModal()
            queryClient.invalidateQueries('videos')
          }}
        />
      </Modal>
    </div>
  )
}

export default VideosPage