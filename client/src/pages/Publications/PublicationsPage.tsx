import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Edit, Trash2, Star, StarOff, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { publicationsAPI } from '../../services/api'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import PublicationForm from './PublicationForm'

const PublicationsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState('')

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['publications', selectedCategory],
    () => publicationsAPI.getAll({ category: selectedCategory || undefined })
  )

  const deleteMutation = useMutation(publicationsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('publications')
      toast.success('Publication deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete publication')
    }
  })

  const toggleFeaturedMutation = useMutation(publicationsAPI.toggleFeatured, {
    onSuccess: () => {
      queryClient.invalidateQueries('publications')
      toast.success('Featured status updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update featured status')
    }
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this publication?')) {
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

  const categories = ['Press Release', 'Magazine', 'Newspaper', 'Online Article', 'Award', 'Certificate']
  const publications = data?.data?.data?.publications || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Publications Management</h1>
          <p className="text-gray-600">Manage press releases, articles, and media coverage</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} 
          style={{
            color: 'white',
            backgroundColor: 'black',
            borderColor: 'black',
            cursor: 'pointer',
          }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Publication
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

      {/* Publications Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.map((publication: any) => (
            <div key={publication._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                {publication.image?.url ? (
                  <img
                    src={publication.image.url}
                    alt={publication.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                {publication.featured && (
                  <div className="absolute top-2 right-2 bg-warning-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Featured
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  {publication.category}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {publication.title}
                  </h3>
                </div>
                
                {publication.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {publication.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  {publication.source && (
                    <span className="truncate">{publication.source}</span>
                  )}
                  {publication.publishedDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(publication.publishedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFeatured(publication._id)}
                    disabled={toggleFeaturedMutation.isLoading}
                  >
                    {publication.featured ? (
                      <Star className="w-4 h-4 text-warning-500 fill-current" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(publication)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(publication._id)}
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
        title={editingItem ? 'Edit Publication' : 'Add Publication'}
        size="lg"
      >
        <PublicationForm
          item={editingItem}
          onSuccess={() => {
            handleCloseModal()
            queryClient.invalidateQueries('publications')
          }}
        />
      </Modal>
    </div>
  )
}

export default PublicationsPage