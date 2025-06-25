import React, { useState, useEffect } from 'react'
import { useMutation } from 'react-query'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { galleryAPI, uploadAPI } from '../../services/api'
import Button from '../../components/UI/Button'
import FileUpload from '../../components/UI/FileUpload'

interface GalleryFormProps {
  item?: any
  onSuccess: () => void
}

const GalleryForm: React.FC<GalleryFormProps> = ({ item, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Residential',
    description: '',
    location: '',
    client: '',
    tags: [] as string[],
    featured: false,
    status: 'published'
  })
  const [images, setImages] = useState<any[]>([])
  const [uploadedImages, setUploadedImages] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        category: item.category || 'Residential',
        description: item.description || '',
        location: item.location || '',
        client: item.client || '',
        tags: item.tags || [],
        featured: item.featured || false,
        status: item.status || 'published'
      })
      setUploadedImages(item.images || [])
    }
  }, [item])

  const createMutation = useMutation(galleryAPI.create, {
    onSuccess: () => {
      toast.success('Gallery item created successfully')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create gallery item')
    }
  })

  const updateMutation = useMutation(
    (data: any) => galleryAPI.update(item._id, data),
    {
      onSuccess: () => {
        toast.success('Gallery item updated successfully')
        onSuccess()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update gallery item')
      }
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (uploadedImages.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    const submitData = {
      ...formData,
      images: uploadedImages
    }

    if (item) {
      updateMutation.mutate(submitData)
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploading(true)
    try {
      const formDataUpload = new FormData()
      files.forEach(file => {
        formDataUpload.append('images', file)
      })
      formDataUpload.append('type', 'gallery')
      formDataUpload.append('category', formData.category)
      formDataUpload.append('projectName', formData.title || 'untitled')

      const response = await uploadAPI.uploadImages(formDataUpload)
      setUploadedImages(prev => [...prev, ...response.data.data])
      toast.success(`${files.length} image(s) uploaded successfully`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload images')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    setFormData(prev => ({ ...prev, tags }))
  }

  const categories = [
    "All",
    "High Rise Residential",
    "Low Rise Residential",
    "Villa Township",
    "Landscape + Resort",
    "Interior Units",
    "House Models",
    "Commercial Models",
    "Institutional Models",
    "Villa Unit Models",
    "Industrial / Factory Models",
    "Healthcare Hospital Models",
    "Water supply Models",
    "Residential Township",
    "Industrial Township",
    "Monochromatic Models",
    "Art Models",
    "Sectional Models",
    "Monuments",
    "Miscellaneous",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            placeholder="Enter gallery title"
          />
        </div>

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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          required
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter gallery description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client
          </label>
          <input
            type="text"
            name="client"
            value={formData.client}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter client name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={formData.tags.join(', ')}
          onChange={handleTagsChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter tags separated by commas"
        />
      </div>

      <div className="flex items-center space-x-6">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images *
        </label>
        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept="image/*"
          multiple={true}
          maxFiles={10}
          type="image"
        />
      </div>

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Uploaded Images ({uploadedImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="submit"
          loading={createMutation.isLoading || updateMutation.isLoading || isUploading}
          disabled={uploadedImages.length === 0}
        >
          {item ? 'Update Gallery Item' : 'Create Gallery Item'}
        </Button>
      </div>
    </form>
  )
}

export default GalleryForm