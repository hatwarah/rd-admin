import React, { useState, useEffect } from 'react'
import { useMutation } from 'react-query'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { testimonialsAPI, uploadAPI } from '../../services/api'
import Button from '../../components/UI/Button'
import FileUpload from '../../components/UI/FileUpload'

interface TestimonialFormProps {
  item?: any
  onSuccess: () => void
}

const TestimonialForm: React.FC<TestimonialFormProps> = ({ item, onSuccess }) => {
  const [formData, setFormData] = useState({
    quote: '',
    author: '',
    position: '',
    company: '',
    rating: 5,
    featured: false,
    status: 'published',
    order: 0
  })
  const [avatar, setAvatar] = useState<any>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        quote: item.quote || '',
        author: item.author || '',
        position: item.position || '',
        company: item.company || '',
        rating: item.rating || 5,
        featured: item.featured || false,
        status: item.status || 'published',
        order: item.order || 0
      })
      setAvatar(item.avatar)
    }
  }, [item])

  const createMutation = useMutation(testimonialsAPI.create, {
    onSuccess: () => {
      toast.success('Testimonial created successfully')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create testimonial')
    }
  })

  const updateMutation = useMutation(
    (data: any) => testimonialsAPI.update(item._id, data),
    {
      onSuccess: () => {
        toast.success('Testimonial updated successfully')
        onSuccess()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update testimonial')
      }
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!avatar) {
      toast.error('Please upload an avatar image')
      return
    }

    const submitData = {
      ...formData,
      avatar: {
        url: avatar.url,
        publicId: avatar.publicId
      }
    }

    if (item) {
      updateMutation.mutate(submitData)
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleAvatarSelected = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploadingAvatar(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('avatar', files[0])

      const response = await uploadAPI.uploadTestimonialAvatar(formDataUpload)
      setAvatar(response.data.data)
      toast.success('Avatar uploaded successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseInt(value) : value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quote *
        </label>
        <textarea
          name="quote"
          required
          rows={4}
          value={formData.quote}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter testimonial quote"
          maxLength={2000}
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.quote.length}/2000 characters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Author Name *
          </label>
          <input
            type="text"
            name="author"
            required
            value={formData.author}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter author name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position/Title
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter position or title"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter company name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <select
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value={5}>5 Stars</option>
            <option value={4}>4 Stars</option>
            <option value={3}>3 Stars</option>
            <option value={2}>2 Stars</option>
            <option value={1}>1 Star</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order
          </label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Display order"
          />
        </div>

        <div className="flex items-center pt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Featured</span>
          </label>
        </div>
      </div>

      {/* Avatar Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Avatar Image *
        </label>
        {avatar ? (
          <div className="relative inline-block">
            <img
              src={avatar.url}
              alt="Avatar"
              className="w-24 h-24 object-cover rounded-full"
            />
            <button
              type="button"
              onClick={() => setAvatar(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <FileUpload
            onFilesSelected={handleAvatarSelected}
            accept="image/*"
            multiple={false}
            maxFiles={1}
            type="image"
          />
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="submit"
          style={{
            color: 'white',
            backgroundColor: 'black',
            borderColor: 'black',
            cursor: 'pointer',
          }}
          loading={createMutation.isLoading || updateMutation.isLoading || isUploadingAvatar}
          disabled={!avatar}
        >
          {item ? 'Update Testimonial' : 'Create Testimonial'}
        </Button>
      </div>
    </form>
  )
}

export default TestimonialForm