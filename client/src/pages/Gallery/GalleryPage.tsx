import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Edit, Trash2, Star, StarOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { galleryAPI } from '../../services/api'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import GalleryForm from './GalleryForm'

const GalleryPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState('')

  const queryClient = useQueryClient()

  interface GalleryItem {
    _id: string;
    title: string;
    category: string;
    description: string;
    images: Array<{
      url: string;
      publicId: string;
      order: number;
      _id: string;
    }>;
    featured: boolean;
    createdAt: string;
  }

  interface ApiResponse {
    data: {
      galleries: GalleryItem[];
      totalPages: number;
      currentPage: number;
      total: number;
    };
  }

  const { data: response, isLoading, error } = useQuery<ApiResponse>(
    ['gallery', selectedCategory],
    async () => {
      const res = await galleryAPI.getAll({ category: selectedCategory || undefined });
      console.log('API Response:', res);
      return res.data; // Assuming the response has a data property with the galleries
    },
    {
      onError: (err) => {
        console.error('Error fetching galleries:', err);
      }
    }
  );

  const galleryItems = response?.data?.galleries || [];
  
  // Debug effect to log the current gallery items
  React.useEffect(() => {
    console.log('Gallery items:', galleryItems);
  }, [galleryItems]);

  const deleteMutation = useMutation(galleryAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('gallery')
      toast.success('Gallery item deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete gallery item')
    }
  })

  const toggleFeaturedMutation = useMutation(galleryAPI.toggleFeatured, {
    onSuccess: () => {
      queryClient.invalidateQueries('gallery')
      toast.success('Featured status updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update featured status')
    }
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this gallery item?')) {
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

  const categories = ['Residential', 'Commercial', 'Mixed-Use', 'Institutional', 'Miscellaneous']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600">Manage your gallery images and projects</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} 
          style={{
            color: 'white',
            backgroundColor: 'black',
            borderColor: 'black',
            cursor: 'pointer',
          }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Gallery Item
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

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.length > 0 ? (
            galleryItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  {item.images?.[0]?.url ? (
                    <img
                      src={item.images[0].url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  {item.featured && (
                    <div className="absolute top-2 right-2 bg-warning-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Featured
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {item.title}
                    </h3>
                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{item.images?.length || 0} images</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFeatured(item._id)}
                      disabled={toggleFeaturedMutation.isLoading}
                    >
                      {item.featured ? (
                        <Star className="w-4 h-4 text-warning-500 fill-current" />
                      ) : (
                        <StarOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item._id)}
                      disabled={deleteMutation.isLoading}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">
                {isLoading ? 'Loading...' : 'No gallery items found'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Gallery Item' : 'Add Gallery Item'}
        size="xl"
      >
        <GalleryForm
          item={editingItem}
          onSuccess={() => {
            handleCloseModal()
            queryClient.invalidateQueries('gallery')
          }}
        />
      </Modal>
    </div>
  )
}

export default GalleryPage