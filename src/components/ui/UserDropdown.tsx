'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'

export default function UserDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data: session } = useSession()
  const userName = session?.user?.name || 'User'
  const userEmail = session?.user?.email || 'example@email.com'
  const userInitial = userName?.[0]?.toUpperCase() || 'U'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      {/* User Avatar Button */}
      <button 
        onClick={() => setOpen(!open)} 
        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-gray-200"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
          <span className="text-white font-semibold text-sm">{userInitial}</span>
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900">{userName}</p>
          <p className="text-xs text-gray-500">Super Admin</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
          open ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg rounded-xl z-50 py-2 animate-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{userInitial}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link 
              href="/admin/account/profile" 
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
              onClick={() => setOpen(false)}
            >
              <User className="w-4 h-4 text-gray-500" />
              <span>My Profile</span>
            </Link>
            
            <Link 
              href="/admin/account/settings" 
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
              onClick={() => setOpen(false)}
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <span>Account Settings</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-2"></div>

          {/* Logout Button */}
          <button 
  onClick={() => {
    setOpen(false)
    signOut({ callbackUrl: '/login?status=logout' })  // ✅ Add query param
  }} 
  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
>
  <LogOut className="w-4 h-4" />
  <span>Sign Out</span>
</button>

        </div>
      )}
    </div>
  )
}
