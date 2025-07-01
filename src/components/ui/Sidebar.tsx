'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  ShoppingBag, 
  Users, 
  BarChart3,
  FileText,
  CreditCard,
  ChevronRight,
  X
} from 'lucide-react'

const links = [
  { 
    href: '/admin', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    description: 'Overview & Analytics'
  },
  { 
    href: '/admin/products', 
    label: 'Products', 
    icon: ShoppingBag,
    description: 'Manage inventory'
  },
  { 
    href: '/admin/users', 
    label: 'Users', 
    icon: Users,
    description: 'Customer management'
  },
  {
    href: '/admin/roles', 
    label: 'Roles', 
    icon: User,
    description: 'User roles & permissions'
  },
  { 
    href: '/admin/reports', 
    label: 'Reports', 
    icon: FileText,
    description: 'Sales & performance reports'
  },
  { 
    href: '/admin/settings', 
    label: 'Settings', 
    icon: Settings,
    description: 'System configuration'
  },
  { 
    href: '/admin/orders', 
    label: 'Orders', 
    icon: CreditCard,
    description: 'Order tracking'
  },
  { 
    href: '/admin/analytics', 
    label: 'Analytics', 
    icon: BarChart3,
    description: 'Reports & insights'
  },
  // { 
  //   href: '/admin/account/profile', 
  //   label: 'Profile', 
  //   icon: User,
  //   description: 'Account settings'
  // },
  // { 
  //   href: '/admin/account/settings', 
  //   label: 'Settings', 
  //   icon: Settings,
  //   description: 'System configuration'
  // },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-3">
            MAIN MENU
          </h3>
          {links.slice(0, 5).map(({ href, label, icon: Icon, description }) => {
            const isActive = pathname === href
            return (
              <Link 
                key={href} 
                href={href}
                onClick={onClose} // Close mobile menu when link is clicked
                className={`group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 hover:bg-gray-100 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-blue-900' : ''
                    }`}>
                      {label}
                    </span>
                    <span className="text-xs text-gray-400">{description}</span>
                  </div>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                )}
              </Link>
            )
          })}
        </div>

        <div>
          {links.slice(5).map(({ href, label, icon: Icon, description }) => {
            const isActive = pathname === href
            return (
              <Link 
                key={href} 
                href={href}
                onClick={onClose} // Close mobile menu when link is clicked
                className={`group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 hover:bg-gray-50 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-blue-900' : ''
                    }`}>
                      {label}
                    </span>
                    <span className="text-xs text-gray-400">{description}</span>
                  </div>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">System Status</p>
              <p className="text-xs text-green-600">All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <aside className="fixed left-0 top-0 w-64 h-full bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}