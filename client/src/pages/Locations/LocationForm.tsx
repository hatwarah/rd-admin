import React, { useState, useEffect } from 'react'
import { useMutation } from 'react-query'
import { X, Plus, Minus } from 'lucide-react'
import toast from 'react-hot-toast'
import { locationsAPI, uploadAPI } from '../../services/api'
import Button from '../../components/UI/Button'
import FileUpload from '../../components/UI/FileUpload'

interface LocationFormProps {
  item?: any
  onSuccess: () => void
}

const LocationForm: React.FC<LocationFormProps> = ({ item, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: [''],
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    phone: '',
    email: '',
    coordinates: {
      latitude: '',
      longitude: ''
    },
    isHeadOffice: false,
    status: 'active',
    order: 0
  })
  const [iconicImage, setIconicImage] = useState<any>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        address: item.address || [''],
        city: item.city || '',
        state: item.state || '',
        country: item.country || 'India',
        pincode: item.pincode || '',
        phone: item.phone || '',
        email: item.email || '',
        coordinates: {
          latitude: item.coordinates?.latitude?.toString() || '',
          longitude: item.coordinates?.longitude?.toString() || ''
        },
        isHeadOffice: item.isHeadOffice || false,
        status: item.status || 'active',
        order: item.order || 0
      })
      setIconicImage(item.iconicImage)
    }
  }, [item])

  const createMutation = useMutation(locationsAPI.create, {
    onSuccess: () => {
      toast.success('Location created successfully')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create location')
    }
  })

  const updateMutation = useMutation(
    (data: any) => locationsAPI.update(item._id, data),
    {
      onSuccess: () => {
        toast.success('Location updated successfully')
        onSuccess()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update location')
      }
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!iconicImage) {
      toast.error('Please upload an iconic image')
      return
    }

    const submitData = {
      ...formData,
      address: formData.address.filter(line => line.trim() !== ''),
      coordinates: {
        latitude: formData.coordinates.latitude ? parseFloat(formData.coordinates.latitude) : undefined,
        longitude: formData.coordinates.longitude ? parseFloat(formData.coordinates.longitude) : undefined
      },
      iconicImage: {
        url: iconicImage.url,
        publicId: iconicImage.publicId
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
      formDataUpload.append('iconicImage', files[0])

      const response = await uploadAPI.uploadLocationImage(formDataUpload)
      setIconicImage(response.data.data)
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (name.startsWith('coordinates.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                 type === 'number' ? parseInt(value) || 0 : value
      }))
    }
  }

  const handleAddressChange = (index: number, value: string) => {
    const newAddress = [...formData.address]
    newAddress[index] = value
    setFormData(prev => ({ ...prev, address: newAddress }))
  }

  const addAddressLine = () => {
    setFormData(prev => ({ ...prev, address: [...prev.address, ''] }))
  }

  const removeAddressLine = (index: number) => {
    if (formData.address.length > 1) {
      const newAddress = formData.address.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, address: newAddress }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location Name *
        </label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter location name"
        />
      </div>

      {/* Address Lines */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address *
        </label>
        {formData.address.map((line, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={line}
              onChange={(e) => handleAddressChange(index, e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={`Address line ${index + 1}`}
              required={index === 0}
            />
            {formData.address.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAddressLine(index)}
              >
                <Minus className="w-4 h-4" />
              </Button>
            )}
            {index === formData.address.length - 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addAddressLine}
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            name="city"
            required
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter city"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State *
          </label>
          <input
            type="text"
            name="state"
            required
            value={formData.state}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter state"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country *
          </label>
          <input
            type="text"
            name="country"
            required
            value={formData.country}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter country"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pincode
          </label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter pincode"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter email address"
        />
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            name="coordinates.latitude"
            value={formData.coordinates.latitude}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter latitude"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            name="coordinates.longitude"
            value={formData.coordinates.longitude}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter longitude"
          />
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

        <div className="flex items-center pt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isHeadOffice"
              checked={formData.isHeadOffice}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Head Office</span>
          </label>
        </div>
      </div>

      {/* Iconic Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Iconic Image *
        </label>
        {iconicImage ? (
          <div className="relative inline-block">
            <img
              src={iconicImage.url}
              alt="Iconic"
              className="w-48 h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => setIconicImage(null)}
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
          disabled={!iconicImage}
        >
          {item ? 'Update Location' : 'Create Location'}
        </Button>
      </div>
    </form>
  )
}

export default LocationForm