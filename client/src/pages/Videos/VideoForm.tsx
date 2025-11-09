import React, { useState, useEffect } from 'react'
import { useMutation } from 'react-query'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { videosAPI, uploadAPI } from '../../services/api'
import Button from '../../components/UI/Button'
import FileUpload from '../../components/UI/FileUpload'

interface VideoFormProps {
  item?: any
  onSuccess: () => void
}

const VideoForm: React.FC<VideoFormProps> = ({ item, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Residential',
    description: '',
    duration: '',
    location: '',
    client: '',
    featured: false,
    status: 'published',
    resolution: '1080p',
    order: 0
  })
  const [thumbnail, setThumbnail] = useState<any>(null)
  const [video, setVideo] = useState<any>(null)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        category: item.category || 'Residential',
        description: item.description || '',
        duration: item.duration || '',
        location: item.location || '',
        client: item.client || '',
        featured: item.featured || false,
        status: item.status || 'published',
        resolution: item.resolution || '1080p',
        order: item.order || 0
      })
      setThumbnail(item.thumbnail)
      setVideo({
        url: item.videoUrl,
        publicId: item.videoPublicId
      })
    }
  }, [item])

  const createMutation = useMutation(videosAPI.create, {
    onSuccess: () => {
      toast.success('Video created successfully')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create video')
    }
  })

  const updateMutation = useMutation(
    (data: any) => videosAPI.update(item._id, data),
    {
      onSuccess: () => {
        toast.success('Video updated successfully')
        onSuccess()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update video')
      }
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!video) {
      toast.error('Please upload a video')
      return
    }

    const submitData = {
      ...formData,
      ...(thumbnail ? {
        thumbnail: {
          url: thumbnail.url || '',
          publicId: thumbnail.publicId || ''
        }
      } : {}),
      videoUrl: video?.url || '',
      videoPublicId: video?.publicId || ''
    }

    if (item) {
      updateMutation.mutate(submitData)
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleThumbnailSelected = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploadingThumbnail(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('thumbnail', files[0])
      formDataUpload.append('category', formData.category)

      const response = await uploadAPI.uploadThumbnail(formDataUpload)
      setThumbnail(response.data.data)
      toast.success('Thumbnail uploaded successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload thumbnail')
    } finally {
      setIsUploadingThumbnail(false)
    }
  }

  const handleVideoSelected = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploadingVideo(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('video', files[0])
      formDataUpload.append('category', formData.category)

      const response = await uploadAPI.uploadVideo(formDataUpload)
      setVideo(response.data.data)
      toast.success('Video uploaded successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload video')
    } finally {
      setIsUploadingVideo(false)
    }
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

  const categories = ['Residential', 'Commercial', 'Mixed-Use', 'Institutional', 'Walkthrough', 'Animation']

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
            placeholder="Enter video title"
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
          placeholder="Enter video description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., 3:45"
          />
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
            className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., 3:45"
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
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
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
      </div>



      {/* Thumbnail Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thumbnail *
        </label>
        {thumbnail ? (
          <div className="relative inline-block">
            <img
              src={thumbnail.url}
              alt="Thumbnail"
              className="w-32 h-20 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => setThumbnail(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <FileUpload
            onFilesSelected={handleThumbnailSelected}
            accept="image/*"
            multiple={false}
            maxFiles={1}
            type="image"
          />
        )}
      </div>

      {/* Video Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video *
        </label>
        {video ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <span className="text-sm text-gray-700">Video uploaded</span>
              <button
                type="button"
                onClick={() => setVideo(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <FileUpload
            onFilesSelected={handleVideoSelected}
            accept="video/*"
            multiple={false}
            maxFiles={1}
            type="video"
          />
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="submit"
          style={{
            backgroundColor: "black",
            color: 'white'
          }}
          loading={createMutation.isLoading || updateMutation.isLoading || isUploadingThumbnail || isUploadingVideo}
          disabled={!video}
        >
          {item ? 'Update Video' : 'Create Video'}
        </Button>
      </div>
    </form>
  )
}

export default VideoForm