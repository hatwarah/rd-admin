import React, { useState, useEffect } from 'react'
import { useMutation } from 'react-query'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { clientsAPI, uploadAPI } from '../../services/api'
import Button from '../../components/UI/Button'
import FileUpload from '../../components/UI/FileUpload'

interface ClientFormProps {
  item?: any
  onSuccess: () => void
}

const ClientForm: React.FC<ClientFormProps> = ({ item, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Real Estate',
    description: '',
    website: '',
    projectsCompleted: 0,
    featured: false,
    status: 'active',
    order: 0
  })
  const [logo, setLogo] = useState<any>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || 'Real Estate',
        description: item.description || '',
        website: item.website || '',
        projectsCompleted: item.projectsCompleted || 0,
        featured: item.featured || false,
        status: item.status || 'active',
        order: item.order || 0
      })
      setLogo(item.logo)
    }
  }, [item])

  const createMutation = useMutation(clientsAPI.create, {
    onSuccess: () => {
      toast.success('Client created successfully')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create client')
    }
  })

  const updateMutation = useMutation(
    (data: any) => clientsAPI.update(item._id, data),
    {
      onSuccess: () => {
        toast.success('Client updated successfully')
        onSuccess()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update client')
      }
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!logo) {
      toast.error('Please upload a logo')
      return
    }

    const submitData = {
      ...formData,
      logo: {
        url: logo.url,
        publicId: logo.publicId
      }
    }

    if (item) {
      updateMutation.mutate(submitData)
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleLogoSelected = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploadingLogo(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('logo', files[0])

      const response = await uploadAPI.uploadClientLogo(formDataUpload)
      setLogo(response.data.data)
      toast.success('Logo uploaded successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload logo')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const categories = ['Real Estate', 'Government', 'Corporate', 'Educational', 'Healthcare', 'Industrial', 'Other']

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Client Name *
        </label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter client name"
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
            Website
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter client description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Projects Completed
          </label>
          <input
            type="number"
            name="projectsCompleted"
            min="0"
            value={formData.projectsCompleted}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Number of projects"
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Client Logo *
        </label>
        {logo ? (
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
              <img
                src={logo.url}
                alt="Logo"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => setLogo(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <FileUpload
            onFilesSelected={handleLogoSelected}
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
          loading={createMutation.isLoading || updateMutation.isLoading || isUploadingLogo}
          disabled={!logo}
        >
          {item ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  )
}

export default ClientForm