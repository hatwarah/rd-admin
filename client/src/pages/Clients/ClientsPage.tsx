import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Edit, Trash2, Star, StarOff, Building } from 'lucide-react'
import toast from 'react-hot-toast'
import { clientsAPI } from '../../services/api'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import ClientForm from './ClientForm'

const ClientsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState('')

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['clients', selectedCategory],
    () => clientsAPI.getAll({ category: selectedCategory || undefined })
  )

  const deleteMutation = useMutation(clientsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('clients')
      toast.success('Client deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete client')
    }
  })

  const toggleFeaturedMutation = useMutation(clientsAPI.toggleFeatured, {
    onSuccess: () => {
      queryClient.invalidateQueries('clients')
      toast.success('Featured status updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update featured status')
    }
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
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

  const categories = ['Real Estate', 'Government', 'Corporate', 'Educational', 'Healthcare', 'Industrial', 'Other']
  const clients = data?.data?.data?.clients || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients Management</h1>
          <p className="text-gray-600">Manage your client portfolio and logos</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} 
          style={{
            color: 'white',
            backgroundColor: 'black',
            borderColor: 'black',
            cursor: 'pointer',
          }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
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

      {/* Clients Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clients.map((client: any) => (
            <div key={client._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="aspect-square bg-gray-50 relative overflow-hidden p-4 flex items-center justify-center">
                {client.logo?.url ? (
                  <img
                    src={client.logo.url}
                    alt={client.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Building className="w-12 h-12" />
                  </div>
                )}
                {client.featured && (
                  <div className="absolute top-2 right-2 bg-warning-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Featured
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  {client.category}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {client.name}
                  </h3>
                </div>
                
                {client.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {client.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{client.projectsCompleted || 0} projects</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    client.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {client.status}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFeatured(client._id)}
                    disabled={toggleFeaturedMutation.isLoading}
                  >
                    {client.featured ? (
                      <Star className="w-4 h-4 text-warning-500 fill-current" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(client)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(client._id)}
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
        title={editingItem ? 'Edit Client' : 'Add Client'}
        size="lg"
      >
        <ClientForm
          item={editingItem}
          onSuccess={() => {
            handleCloseModal()
            queryClient.invalidateQueries('clients')
          }}
        />
      </Modal>
    </div>
  )
}

export default ClientsPage