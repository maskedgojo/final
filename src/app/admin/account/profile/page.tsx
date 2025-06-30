'use client'

import { useEffect, useState } from 'react'
import { User, Mail, Shield, Save, Edit3, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  lastLogin?: string
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [formData, setFormData] = useState<UserData>({
    id: '',
    name: '',
    email: '',
    role: 'Super Admin'
  })
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    // Update the fetchUser function in your page.tsx
const fetchUser = async () => {
  try {
    setInitialLoading(true)
    const res = await fetch('/api/user/profile', {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Ensure fresh data
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to fetch user')
    }

    const data = await res.json()
    setFormData({ 
      id: data.id || '',
      name: data.name || '',
      email: data.email || '',
      role: data.role || 'User',
      lastLogin: data.lastLogin || ''
    })
  } catch (err) {
    console.error('Error fetching user:', err)
    toast.error(err instanceof Error ? err.message : 'Failed to load profile')
    
    // Redirect if unauthorized
    if (err.message.includes('authenticated')) {
      window.location.href = '/login'
    }
  } finally {
    setInitialLoading(false)
  }
}}, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || 'Update failed')
      }

      // Update session if email changed
      if (formData.email !== result.user.email) {
        toast.success('Email updated. Please log in again.')
        setTimeout(() => {
          signOut({ callbackUrl: '/login' })
        }, 2000)
        return
      }

      // Update local state and session
      setFormData(prev => ({ ...prev, ...result.user }))
      await update({ name: result.user.name })
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (err: any) {
      console.error('Update error:', err)
      toast.error(err.message || 'Update failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => setIsEditing(true)

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form to original values
    fetchUserData()
  }

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        setFormData({ 
          id: data.id || '',
          name: data.name || '',
          email: data.email || '',
          role: data.role || 'Super Admin',
          lastLogin: data.lastLogin || ''
        })
      }
    } catch (err) {
      console.error('Error refreshing data:', err)
      toast.error('Failed to refresh user info')
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

  const [fetchAttempts, setFetchAttempts] = useState(0)

useEffect(() => {
  const fetchUser = async () => {
    try {
      console.log("Fetching user profile...") // Debug log
      setInitialLoading(true)
      
      const res = await fetch('/api/user/profile', {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })

      console.log("Response status:", res.status) // Debug log
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch user')
      }

      const data = await res.json()
      console.log("User data received:", data) // Debug log
      
      setFormData({ 
        id: data.id || '',
        name: data.name || '',
        email: data.email || '',
        role: data.role || 'User',
        lastLogin: data.lastLogin || ''
      })
    } catch (err) {
      console.error('Profile fetch error:', err)
      setFetchAttempts(prev => prev + 1)
      
      if (fetchAttempts < 2) {
        toast.error('Retrying...')
        setTimeout(fetchUser, 2000 * fetchAttempts)
      } else {
        toast.error(err instanceof Error ? err.message : 'Failed to load profile')
        setInitialLoading(false)
      }
    } finally {
      if (fetchAttempts >= 2) {
        setInitialLoading(false)
      }
    }
  }

  fetchUser()
}, [fetchAttempts])

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
                <h1 className="text-xl font-semibold text-black">{formData.name}</h1>
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield size={16} /> {formData.role}
                </p>
              </div>
            </div>
            {!isEditing && (
              <button 
                onClick={handleEdit} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
              >
                <Edit3 size={16} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 border border-gray-200 shadow space-y-6">
          <h2 className="text-lg font-semibold text-black">Profile Information</h2>

          {/* Name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
              <User size={16} /> Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              required
              minLength={2}
              placeholder="Enter your full name"
              className={`w-full px-4 py-2 rounded-md text-sm border ${
                isEditing 
                  ? 'border-blue-500 bg-white focus:ring-2 focus:ring-blue-200' 
                  : 'border-gray-200 bg-gray-100'
              } outline-none transition-colors`}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail size={16} /> Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              required
              placeholder="Enter your email"
              className={`w-full px-4 py-2 rounded-md text-sm border ${
                isEditing 
                  ? 'border-blue-500 bg-white focus:ring-2 focus:ring-blue-200' 
                  : 'border-gray-200 bg-gray-100'
              } outline-none transition-colors`}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
              <Shield size={16} /> Role
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              disabled
              className="w-full px-4 py-2 rounded-md text-sm border border-gray-200 bg-gray-100 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Role cannot be modified. Contact admin to change roles.</p>
          </div>

          {isEditing && (
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
                  loading 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <Save size={16} />
                )}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 border border-gray-200 bg-white text-sm font-medium rounded-md px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
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