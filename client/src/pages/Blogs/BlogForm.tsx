import React, { useState, useEffect } from 'react'
import { useMutation } from 'react-query'
import { X, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { blogsAPI, uploadAPI } from '../../services/api'
import Button from '../../components/UI/Button'
import FileUpload from '../../components/UI/FileUpload'

interface BlogFormProps {
  item?: any
  onSuccess: () => void
}

const BlogForm: React.FC<BlogFormProps> = ({ item, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Technology',
    author: '',
    authorTitle: '',
    tags: [] as string[],
    featured: false,
    status: 'draft',
    metaTitle: '',
    metaDescription: ''
  })
  const [featuredImage, setFeaturedImage] = useState<any>(null)
  const [authorImage, setAuthorImage] = useState<any>(null)
  const [isUploadingFeatured, setIsUploadingFeatured] = useState(false)
  const [isUploadingAuthor, setIsUploadingAuthor] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        content: item.content || '',
        excerpt: item.excerpt || '',
        category: item.category || 'Technology',
        author: item.author || '',
        authorTitle: item.authorTitle || '',
        tags: item.tags || [],
        featured: item.featured || false,
        status: item.status || 'draft',
        metaTitle: item.metaTitle || '',
        metaDescription: item.metaDescription || ''
      })
      setFeaturedImage(item.image)
      setAuthorImage(item.authorImage)
    }
  }, [item])

  const createMutation = useMutation(blogsAPI.create, {
    onSuccess: () => {
      toast.success('Blog post created successfully')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create blog post')
    }
  })

  const updateMutation = useMutation(
    (data: any) => blogsAPI.update(item._id, data),
    {
      onSuccess: () => {
        toast.success('Blog post updated successfully')
        onSuccess()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update blog post')
      }
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!featuredImage) {
      toast.error('Please upload a featured image')
      return
    }

    const submitData = {
      ...formData,
      image: {
        url: featuredImage.url,
        publicId: featuredImage.publicId
      },
      ...(authorImage && {
        authorImage: {
          url: authorImage.url,
          publicId: authorImage.publicId
        }
      })
    }

    if (item) {
      updateMutation.mutate(submitData)
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleFeaturedImageSelected = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploadingFeatured(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', files[0])

      const response = await uploadAPI.uploadBlogImage(formDataUpload)
      setFeaturedImage(response.data.data)
      toast.success('Featured image uploaded successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload featured image')
    } finally {
      setIsUploadingFeatured(false)
    }
  }

  const handleAuthorImageSelected = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploadingAuthor(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('authorImage', files[0])

      const response = await uploadAPI.uploadAuthorImage(formDataUpload)
      setAuthorImage(response.data.data)
      toast.success('Author image uploaded successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload author image')
    } finally {
      setIsUploadingAuthor(false)
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

  const categories = ['Technology', 'Architecture', 'Design', 'Craftsmanship', 'Industry', 'Tips']

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
          placeholder="Enter blog title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Excerpt *
        </label>
        <textarea
          name="excerpt"
          required
          rows={3}
          value={formData.excerpt}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter blog excerpt (max 500 characters)"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.excerpt.length}/500 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content * <a href="https://text-html.com/" target="_blank" title="Open Content Editor" className="hover:text-red-500"><ExternalLink className="inline w-4 h-4 ml-1" /></a>
        </label>
        <textarea
          name="content"
          required
          rows={12}
          value={formData.content}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter blog content (HTML supported)"
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Author *
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
            Author Title
          </label>
          <input
            type="text"
            name="authorTitle"
            value={formData.authorTitle}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter author title"
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

      {/* SEO Fields */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter meta title (max 60 characters)"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.metaTitle.length}/60 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              name="metaDescription"
              rows={3}
              value={formData.metaDescription}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter meta description (max 160 characters)"
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.metaDescription.length}/160 characters
            </p>
          </div>
        </div>
      </div>

      {/* Featured Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Featured Image *
        </label>
        {featuredImage ? (
          <div className="relative inline-block">
            <img
              src={featuredImage.url}
              alt="Featured"
              className="w-48 h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => setFeaturedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <FileUpload
            onFilesSelected={handleFeaturedImageSelected}
            accept="image/*"
            multiple={false}
            maxFiles={1}
            type="image"
          />
        )}
      </div>

      {/* Author Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Author Image
        </label>
        {authorImage ? (
          <div className="relative inline-block">
            <img
              src={authorImage.url}
              alt="Author"
              className="w-24 h-24 object-cover rounded-full"
            />
            <button
              type="button"
              onClick={() => setAuthorImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <FileUpload
            onFilesSelected={handleAuthorImageSelected}
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
          loading={createMutation.isLoading || updateMutation.isLoading || isUploadingFeatured || isUploadingAuthor}
          disabled={!featuredImage}
        >
          {item ? 'Update Blog Post' : 'Create Blog Post'}
        </Button>
      </div>
    </form>
  )
}

export default BlogForm