'use client'

import { useEffect, useState } from 'react'
import { User, Mail, Shield, Save, Edit3 } from 'lucide-react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface UserData {
  name: string
  email: string
  role: string
}

export default function ProfilePage() {
  const [formData, setFormData] = useState<UserData>({
    name: '',
    email: '',
    role: 'Super Admin',
  })
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setInitialLoading(true)
        const res = await fetch('/api/user/update-profile')
        if (!res.ok) throw new Error('Failed to fetch user')
        const data = await res.json()
        setFormData({ 
          name: data.name || '',
          email: data.email || '',
          role: data.role || 'Super Admin'
        })
      } catch (err) {
        console.error('Error fetching user:', err)
        toast.error('Failed to load user profile')
      } finally {
        setInitialLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/user/update-profile', {
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
        toast.error(result.message || 'Update failed')
        return
      }

      if (result.signOut) {
        toast.success('Email updated. Please log in again.')
        setTimeout(() => {
          window.location.href = '/api/auth/signout'
        }, 2000)
        return
      }

      setFormData({ ...result.user, role: formData.role })
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (err: any) {
      console.error('Update error:', err.message)
      toast.error('Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => setIsEditing(true)

  const handleCancel = async () => {
    setIsEditing(false)
    setLoading(true)
    try {
      const res = await fetch('/api/user/update-profile')
      if (res.ok) {
        const data = await res.json()
        setFormData({ 
          name: data.name || '',
          email: data.email || '',
          role: data.role || 'Super Admin'
        })
      }
    } catch (err) {
      console.error('Error refreshing data:', err)
      toast.error('Failed to refresh user info')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen p-8 bg-[#F5F6FA]">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow">
            <p className="text-gray-700 text-base text-center">Loading user profile...</p>
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
                <h1 className="text-xl font-semibold text-black">{formData.name || 'Loading...'}</h1>
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield size={16} /> {formData.role}
                </p>
              </div>
            </div>
            {!isEditing && (
              <button onClick={handleEdit} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
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
              value={formData.name || ''}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter your full name"
              className={`text-[#1A1A1A] w-full px-4 py-2 rounded-md text-sm border ${isEditing ? 'border-blue-500 bg-white' : 'border-gray-200 bg-gray-100'} outline-none`}
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
              value={formData.email || ''}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter your email"
              className={`text-[#1A1A1A] w-full px-4 py-2 rounded-md text-sm border ${isEditing ? 'border-blue-500 bg-white' : 'border-gray-200 bg-gray-100'} outline-none`}
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
              className="text-[#1A1A1A] w-full px-4 py-2 rounded-md text-sm border border-gray-200 bg-gray-100  outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Role cannot be modified. Contact admin to change roles.</p>
          </div>

          {isEditing && (
            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              >
                <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 border border-gray-200 bg-white text-sm font-medium rounded-md px-4 py-2 hover:bg-gray-100"
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
            Active • Last login: Today at 10:30 AM
          </div>
        </div>
      </div>
    </div>
  )
}
