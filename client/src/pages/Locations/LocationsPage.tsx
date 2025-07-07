import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Edit, Trash2, MapPin, Phone, Mail, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { locationsAPI } from '../../services/api'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import LocationForm from './LocationForm'

const LocationsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery('locations', () => locationsAPI.getAll())

  const deleteMutation = useMutation(locationsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('locations')
      toast.success('Location deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete location')
    }
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const locations = data?.data?.data?.locations || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locations Management</h1>
          <p className="text-gray-600">Manage office locations and contact information</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} 
          style={{
            color: 'white',
            backgroundColor: 'black',
            borderColor: 'black',
            cursor: 'pointer',
          }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Locations Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location: any) => (
            <div key={location._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                {location.iconicImage?.url ? (
                  <img
                    src={location.iconicImage.url}
                    alt={location.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <MapPin className="w-12 h-12" />
                  </div>
                )}
                {location.isHeadOffice && (
                  <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Head Office
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  {location.city}, {location.state}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {location.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    location.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {location.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      {location.address.map((line: string, index: number) => (
                        <div key={index}>{line}</div>
                      ))}
                    </div>
                  </div>
                  
                  {location.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{location.phone}</span>
                    </div>
                  )}
                  
                  {location.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{location.email}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(location)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(location._id)}
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
        title={editingItem ? 'Edit Location' : 'Add Location'}
        size="lg"
      >
        <LocationForm
          item={editingItem}
          onSuccess={() => {
            handleCloseModal()
            queryClient.invalidateQueries('locations')
          }}
        />
      </Modal>
    </div>
  )
}

export default LocationsPage