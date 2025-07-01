'use client'

import { useEffect, useState } from 'react'
import { User, Mail, Shield, Save, Edit3, Loader2, MapPin, Calendar } from 'lucide-react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  address: string
  dob: string
  lastLogin?: string
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [formData, setFormData] = useState<UserData>({
    id: '',
    name: '',
    email: '',
    role: 'User',
    address: '',
    dob: ''
  })

  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const fetchUser = async () => {
    try {
      console.log("👀 Fetching user profile...")
      setInitialLoading(true)

      const res = await fetch('/api/user/profile', {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      })

      console.log("📦 Response status:", res.status)

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error("❌ Error response data:", errorData)
        throw new Error(errorData.error || 'Failed to fetch profile')
      }

      const data = await res.json()
      console.log("✅ User data received:", data)

      setFormData({
        id: data.id || '',
        name: data.name || '',
        email: data.email || '',
        role: data.role?.name || 'User',
        address: data.address || '',
        dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
        lastLogin: data.lastLogin || ''
      })

    } catch (err) {
      console.error('🚨 Error in fetchUser:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to load profile')

      if (err instanceof Error && err.message.includes('authenticated')) {
        console.warn("🔒 Not authenticated — redirecting to login.")
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
      }
    } finally {
      setInitialLoading(false)
    }
  }

  useEffect(() => {
    console.log("🌀 useEffect: fetching profile...")
    fetchUser()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    console.log("📝 Form data changed:", { ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        address: formData.address,
        dob: formData.dob,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Failed to update profile')
    }

    toast.success('Profile updated successfully!')

    // Check if email changed from session
    if (session?.user?.email && session.user.email !== formData.email) {
      toast.info("Email updated. Please log in again.")
      setTimeout(() => {
        signOut()
      }, 2000)
      return
    }

    setIsEditing(false)
    await update()

  } catch (error) {
    console.error('Error updating profile:', error)
    toast.error(error instanceof Error ? error.message : 'Failed to update profile')
  } finally {
    setLoading(false)
  }
}


  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never logged in'
    const date = new Date(dateString)
    return `Last login: ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen p-8 bg-[#F5F6FA] flex items-center justify-center">
        <div className="max-w-xl w-full">
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow text-center">
            <Loader2 className="animate-spin mx-auto h-8 w-8 text-blue-500" />
            <p className="mt-4 text-gray-700">Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-[#F5F6FA]">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-black">{formData.name || 'Unnamed'}</h1>
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield size={16} /> {formData.role}
                </p>
              </div>
            </div>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
              >
                <Edit3 size={16} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 border border-gray-200 shadow space-y-6">
          <h2 className="text-lg font-semibold text-black">Profile Information</h2>

          {/* Name */}
          <div>
            <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
              <User size={16} /> Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter your full name"
              className={`w-full px-4 py-2 rounded-md text-amber-500 text-sm border ${
                isEditing 
                  ? 'border-blue-500 bg-white focus:ring-2 focus:ring-blue-200' 
                  : 'border-gray-200 bg-gray-100'
              } outline-none transition-colors`}
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail size={16} /> Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter your email"
              className={`w-full px-4 py-2 rounded-md text-amber-500 text-sm border ${
                isEditing 
                  ? 'border-blue-500 bg-white focus:ring-2 focus:ring-blue-200' 
                  : 'border-gray-200 bg-gray-100'
              } outline-none transition-colors`}
            />
          </div>

          {/* Address */}
          <div>
            <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin size={16} /> Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter your address"
              className={`w-full px-4 py-2 rounded-md text-amber-500 text-sm border ${
                isEditing 
                  ? 'border-blue-500 bg-white focus:ring-2 focus:ring-blue-200' 
                  : 'border-gray-200 bg-gray-100'
              } outline-none transition-colors`}
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar size={16} /> Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 rounded-md text-amber-500 text-sm border ${
                isEditing 
                  ? 'border-blue-500 bg-white focus:ring-2 focus:ring-blue-200' 
                  : 'border-gray-200 bg-gray-100'
              } outline-none transition-colors`}
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
              <Shield size={16} /> Role
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              disabled
              className="w-full px-4 py-2 rounded-md text-sm border border-gray-200 bg-gray-100 outline-none text-amber-400"
            />
            <p className="text-xs text-gray-500 mt-1">Role cannot be modified. Contact admin to change roles.</p>
          </div>
        </form>

        {/* Status */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow">
          <h3 className="text-base font-semibold text-black mb-2">Account Status</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Active • {formatLastLogin(formData.lastLogin)}
          </div>
        </div>
      </div>
    </div>
  )
}