import React from 'react'
import { useQuery } from 'react-query'
import { Image, Video, FileText, TrendingUp, Users, Eye } from 'lucide-react'
import { galleryAPI, videosAPI, blogsAPI } from '../../services/api'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

const DashboardPage: React.FC = () => {
  const { data: galleryData, isLoading: galleryLoading } = useQuery(
    'dashboard-gallery',
    () => galleryAPI.getAll({ limit: 5 })
  )

  const { data: videosData, isLoading: videosLoading } = useQuery(
    'dashboard-videos',
    () => videosAPI.getAll({ limit: 5 })
  )

  const { data: blogsData, isLoading: blogsLoading } = useQuery(
    'dashboard-blogs',
    () => blogsAPI.getAll({ limit: 5 })
  )

  const isLoading = galleryLoading || videosLoading || blogsLoading

  const stats = [
    {
      name: 'Total Gallery Items',
      value: galleryData?.data?.total || 0,
      icon: Image,
      color: 'bg-primary-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Total Videos',
      value: videosData?.data?.total || 0,
      icon: Video,
      color: 'bg-secondary-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Total Blog Posts',
      value: blogsData?.data?.total || 0,
      icon: FileText,
      color: 'bg-success-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      name: 'Total Views',
      value: '12.5K',
      icon: Eye,
      color: 'bg-warning-500',
      change: '+23%',
      changeType: 'positive'
    }
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your content management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
              <span className="text-sm text-success-600 font-medium">{stat.change}</span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Gallery Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Gallery Items</h3>
            <Image className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {galleryData?.data?.galleries?.slice(0, 5).map((item: any) => (
              <div key={item._id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                  {item.images?.[0]?.url && (
                    <img
                      src={item.images[0].url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Blog Posts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Blog Posts</h3>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {blogsData?.data?.blogs?.slice(0, 5).map((blog: any) => (
              <div key={blog._id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                  {blog.image?.url && (
                    <img
                      src={blog.image.url}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{blog.title}</p>
                  <p className="text-xs text-gray-500">By {blog.author}</p>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Image className="w-6 h-6 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900">Add Gallery Item</h4>
            <p className="text-sm text-gray-500">Upload new images to gallery</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Video className="w-6 h-6 text-secondary-600 mb-2" />
            <h4 className="font-medium text-gray-900">Upload Video</h4>
            <p className="text-sm text-gray-500">Add new video content</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <FileText className="w-6 h-6 text-success-600 mb-2" />
            <h4 className="font-medium text-gray-900">Write Blog Post</h4>
            <p className="text-sm text-gray-500">Create new blog content</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage