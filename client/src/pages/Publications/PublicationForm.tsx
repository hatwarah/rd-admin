import React, { useState, useEffect } from 'react'
import { useMutation } from 'react-query'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { publicationsAPI, uploadAPI } from '../../services/api'
import Button from '../../components/UI/Button'
import FileUpload from '../../components/UI/FileUpload'

interface PublicationFormProps {
  item?: any
  onSuccess: () => void
}

const PublicationForm: React.FC<PublicationFormProps> = ({ item, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Press Release',
    description: '',
    source: '',
    publishedDate: '',
    featured: false,
    status: 'published',
    order: 0
  })
  const [image, setImage] = useState<any>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        category: item.category || 'Press Release',
        description: item.description || '',
        source: item.source || '',
        publishedDate: item.publishedDate ? new Date(item.publishedDate).toISOString().split('T')[0] : '',
        featured: item.featured || false,
        status: item.status || 'published',
        order: item.order || 0
      })
      setImage(item.image)
    }
  }, [item])

  const createMutation = useMutation(publicationsAPI.create, {
    onSuccess: () => {
      toast.success('Publication created successfully')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create publication')
    }
  })

  const updateMutation = useMutation(
    (data: any) => publicationsAPI.update(item._id, data),
    {
      onSuccess: () => {
        toast.success('Publication updated successfully')
        onSuccess()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update publication')
      }
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!image) {
      toast.error('Please upload an image')
      return
    }

    const submitData = {
      ...formData,
      publishedDate: formData.publishedDate ? new Date(formData.publishedDate) : null,
      image: {
        url: image.url,
        publicId: image.publicId
      }
    }

    if (item) {
      updateMutation.mutate(submitData)
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleImageSelected = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploadingImage(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', files[0])

      const response = await uploadAPI.uploadPublicationImage(formDataUpload)
      setImage(response.data.data)
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload image')
    } finally {
      setIsUploadingImage(false)
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

  const categories = ['Press Release', 'Magazine', 'Newspaper', 'Online Article', 'Award', 'Certificate']

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter publication title"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source
          </label>
          <input
            type="text"
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter publication source"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter publication description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Published Date
          </label>
          <input
            type="date"
            name="publishedDate"
            value={formData.publishedDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

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
      </div>

      <div className="flex items-center">
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

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Publication Image *
        </label>
        {image ? (
          <div className="relative inline-block">
            <img
              src={image.url}
              alt="Publication"
              className="w-48 h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <FileUpload
            onFilesSelected={handleImageSelected}
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
          loading={createMutation.isLoading || updateMutation.isLoading || isUploadingImage}
          disabled={!image}
        >
          {item ? 'Update Publication' : 'Create Publication'}
        </Button>
      </div>
    </form>
  )
}

export default PublicationForm