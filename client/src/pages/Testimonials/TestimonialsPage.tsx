import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Edit, Trash2, Star, StarOff, Quote } from 'lucide-react'
import toast from 'react-hot-toast'
import { testimonialsAPI } from '../../services/api'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import TestimonialForm from './TestimonialForm'

const TestimonialsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState('')

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['testimonials', selectedStatus],
    () => testimonialsAPI.getAll({ status: selectedStatus || undefined })
  )

  const deleteMutation = useMutation(testimonialsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('testimonials')
      toast.success('Testimonial deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete testimonial')
    }
  })

  const toggleFeaturedMutation = useMutation(testimonialsAPI.toggleFeatured, {
    onSuccess: () => {
      queryClient.invalidateQueries('testimonials')
      toast.success('Featured status updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update featured status')
    }
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
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

  const testimonials = data?.data?.data?.testimonials || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials Management</h1>
          <p className="text-gray-600">Manage customer testimonials and reviews</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} 
          style={{
            color: 'white',
            backgroundColor: 'black',
            borderColor: 'black',
            cursor: 'pointer',
          }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Testimonials List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((testimonial: any) => (
            <div key={testimonial._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                      {testimonial.avatar?.url ? (
                        <img
                          src={testimonial.avatar.url}
                          alt={testimonial.author}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Quote className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {testimonial.author}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          testimonial.status === 'published' 
                            ? 'bg-green-100 text-green-800'
                            : testimonial.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {testimonial.status}
                        </span>
                        {testimonial.featured && (
                          <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                      {testimonial.position && (
                        <p className="text-sm text-gray-600">{testimonial.position}</p>
                      )}
                      {testimonial.company && (
                        <p className="text-sm text-gray-500">{testimonial.company}</p>
                      )}
                      <div className="flex items-center mt-1">
                        {[...Array(testimonial.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <blockquote className="text-gray-700 italic border-l-4 border-primary-200 pl-4 mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{new Date(testimonial.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFeatured(testimonial._id)}
                    disabled={toggleFeaturedMutation.isLoading}
                  >
                    {testimonial.featured ? (
                      <Star className="w-4 h-4 text-warning-500 fill-current" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(testimonial)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(testimonial._id)}
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
        title={editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
        size="lg"
      >
        <TestimonialForm
          item={editingItem}
          onSuccess={() => {
            handleCloseModal()
            queryClient.invalidateQueries('testimonials')
          }}
        />
      </Modal>
    </div>
  )
}

export default TestimonialsPage