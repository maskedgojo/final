'use client'

import { useState, useMemo, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { format } from 'date-fns'
import { ChevronDown } from 'lucide-react'
import { useUsersContext } from '@/context/users-context'
import { useRoleContext } from '@/context/role-context'

export default function UserTable() {
  const { users, loading: userLoading, refetchUsers } = useUsersContext()
  const { roles: allRoles, loading: roleLoading } = useRoleContext()

  const [data, setData] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    dob: format(new Date(), 'yyyy-MM-dd'),
    address: '',
    roles: [] as number[],
  })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState<number | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)

  useEffect(() => {
    if (users && users.length > 0) {
      setData(users)
      setIsInitializing(false)
    }
  }, [users])

  const filtered = useMemo(() => {
    if (!searchValue.trim()) return data

    const searchLower = searchValue.toLowerCase()
    return data.filter((u) => {
      const roleNames = (u.userRoles || []).map(ur => ur.role.name).join(' ').toLowerCase()
      return (
        (u.name?.toLowerCase() || '').includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.address.toLowerCase().includes(searchLower) ||
        u.id.toString().includes(searchValue) ||
        format(new Date(u.dob), 'MM/dd/yyyy').includes(searchValue) ||
        roleNames.includes(searchLower)
      )
    })
  }, [data, searchValue])

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${id}`)
        setData(data.filter(u => u.id !== id))
        toast.success('User deleted successfully')
        refetchUsers()
      } catch (err) {
        console.error(err)
        toast.error('Delete failed')
      }
    }
  }

  const handleAddUser = async () => {
    if (!form.email || !form.password) {
      toast.error('Email and password are required')
      return
    }

    setLoading(true)
    try {
      await axios.post('/api/users', {
        ...form,
        dob: new Date(form.dob),
        roles: form.roles
      })

      toast.success('User added successfully')
      refetchUsers()
      resetForm()
      setShowForm(false)
    } catch (err) {
      console.error(err)
      toast.error('Add failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (id: number) => {
    if (!form.email) {
      toast.error('Email is required')
      return
    }

    setLoading(true)
    try {
      await axios.put(`/api/users/${id}`, {
        ...form,
        dob: new Date(form.dob),
        roles: form.roles
      })

      toast.success('User updated successfully')
      refetchUsers()
      resetForm()
      setEditMode(null)
    } catch (err) {
      console.error(err)
      toast.error('Update failed')
    } finally {
      setLoading(false)
    }
  }

  type User = {
    id: number
    name?: string
    email: string
    dob: string | Date
    address: string
    userRoles?: { role: { id: number; name: string } }[]
  }

  const startEditing = (user: User) => {
    setEditMode(user.id)
    setForm({
      name: user.name || '',
      email: user.email,
      password: '',
      dob: format(new Date(user.dob), 'yyyy-MM-dd'),
      address: user.address,
      roles: (user.userRoles || []).map(ur => ur.role.id)
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      dob: format(new Date(), 'yyyy-MM-dd'),
      address: '',
      roles: []
    })
  }

  const handleRoleChange = (roleId: number) => {
    setForm(prev => {
      if (prev.roles.includes(roleId)) {
        return {
          ...prev,
          roles: prev.roles.filter(id => id !== roleId)
        }
      } else {
        return {
          ...prev,
          roles: [...prev.roles, roleId]
        }
      }
    })
  }

if (isInitializing || userLoading || roleLoading) {
  return (
    <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                {['User', 'Email', 'Roles', 'Date of Birth', 'Address', 'Created', 'Actions'].map((header) => (
                  <th
                    key={header}
                    className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {[...Array(6)].map((_, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  {/* User cell */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-3 w-28 bg-gray-300 rounded"></div>
                        <div className="h-2 w-20 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </td>

                  {/* Other cells */}
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="py-4 px-6">
                      <div className="h-3 w-24 bg-gray-300 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}




  return (
    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600 mt-1">Manage your application users</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg px-4 py-2 shadow">
              <span className="text-gray-600">Total Users:</span>
              <span className="text-gray-400 font-bold ml-2">{data.length}</span>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditMode(null)
                resetForm()
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition duration-300 hover:shadow-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              {showForm ? 'Cancel' : 'Add User'}
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Search Users</h2>
          <div className="relative">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-11 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="Search by name, email, address, role, or ID..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {(showForm || editMode !== null) && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editMode !== null ? 'Edit User' : 'Add New User'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  placeholder="Full name" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-500 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-500 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editMode !== null ? 'New Password' : 'Password *'}
                </label>
                <input
                  type="password"
                  placeholder={editMode ? 'Leave blank to keep current' : 'Minimum 8 characters'}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-500 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-500 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  value={form.dob}
                  onChange={e => setForm({ ...form, dob: e.target.value })}
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea 
                  placeholder="Full address" 
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-500 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  value={form.address} 
                  onChange={e => setForm({ ...form, address: e.target.value })} 
                  required
                />
              </div>
              
              {/* Roles Section */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Roles</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition flex items-center justify-between"
                  >
                    <span>
                      {form.roles.length === 0 
                        ? 'Select roles...' 
                        : `${form.roles.length} role${form.roles.length !== 1 ? 's' : ''} selected`
                      }
                    </span>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {roleDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {allRoles.map(role => (
                        <label key={role.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.roles.includes(role.id)}
                            onChange={() => handleRoleChange(role.id)}
                            className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <div className="flex-1">
                            <span className="text-gray-900 font-medium">{role.name}</span>
                            {role.description && (
                              <p className="text-xs text-gray-500">{role.description}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {form.roles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {form.roles.map(roleId => {
                      const role = allRoles.find(r => r.id === roleId);
                      return role ? (
                        <span 
                          key={role.id} 
                          className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded flex items-center"
                        >
                          {role.name}
                          <button
                            type="button"
                            onClick={() => handleRoleChange(role.id)}
                            className="ml-1 text-indigo-600 hover:text-indigo-800"
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2 flex justify-end">
                <button
                  onClick={() => editMode !== null ? handleUpdateUser(editMode) : handleAddUser()}
                  disabled={loading}
                  className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition duration-300 hover:shadow-lg ${
                    loading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editMode !== null ? 'Updating...' : 'Adding...'}
                    </span>
                  ) : editMode !== null ? 'Update User' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
                <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((user) => (
                <tr 
                  key={user.id} 
                  className={`hover:bg-gray-50 transition-all duration-150 ${editMode === user.id ? 'bg-indigo-50' : ''}`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 font-bold">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'Unnamed User'}
                        </div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    {user.emailVerified && (
                      <div className="text-xs text-green-600">
                        Verified: {format(new Date(user.emailVerified), 'MMM d, yyyy')}
                      </div>
                    )}
                  </td>
               <td className="py-4 px-6">
                  <div className="flex flex-wrap gap-1">
                    {(user.userRoles || []).map(({ role }) => (
  <span 
    key={role.id} 
    className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded"
  >
    {role.name}
  </span>
))}

                </div>
              </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {format(user.dob, 'MMM d, yyyy')}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {user.address}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {format(user.createdAt, 'MMM d, yyyy')}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditing(user)}
                        className="flex items-center bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="flex items-center bg-red-100 text-red-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-gray-500">Try adjusting your search or add a new user.</p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setSearchValue('')
                    setShowForm(true)
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Add User
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}