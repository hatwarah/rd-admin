import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Image, 
  Video, 
  FileText, 
  Settings,
  Building2,
  MessageSquare,
  Newspaper,
  Users,
  MapPin
} from 'lucide-react'
import { cn } from '../../utils/cn'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Gallery', href: '/gallery', icon: Image },
  { name: 'Videos', href: '/videos', icon: Video },
  { name: 'Blogs', href: '/blogs', icon: FileText },
  { name: 'Testimonials', href: '/testimonials', icon: MessageSquare },
  { name: 'Publications', href: '/publications', icon: Newspaper },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Locations', href: '/locations', icon: MapPin },
]

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">RD Admin</h1>
            <p className="text-sm text-gray-500">Content Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          © 2025 RD Models
        </div>
      </div>
    </div>
  )
}

export default Sidebar