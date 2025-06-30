'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Save, Trash2, Edit, Plus, X } from 'lucide-react'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

type Role = {
  id: number
  name: string
  description?: string
  permissions: Record<string, boolean>
}

export default function RolesPage() {
  const { data: session } = useSession()
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })

  const [permForm, setPermForm] = useState({
    name: ''
  })

  const [editRoleId, setEditRoleId] = useState<number | null>(null)

  useEffect(() => {
    if (!session) {
      redirect('/signin')
    }
    loadData()
  }, [session])

  const loadData = async () => {
    setLoading(true)
    try {
      const [rolesRes, permsRes] = await Promise.all([
        axios.get('/api/roles'),
        axios.get('/api/permissions')
      ])
      setRoles(rolesRes.data)
      setPermissions(permsRes.data)
    } catch (e) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionToggle = (perm: string) => {
    setRoleForm(prev => {
      if (prev.permissions.includes(perm)) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== perm) }
      } else {
        return { ...prev, permissions: [...prev.permissions, perm] }
      }
    })
  }

  const saveRole = async () => {
    if (!roleForm.name) {
      toast.error('Name is required')
      return
    }

    try {
      const payload = {
        name: roleForm.name,
        description: roleForm.description,
        permissions: Object.fromEntries(roleForm.permissions.map(p => [p, true]))
      }

      if (editRoleId) {
        await axios.put(`/api/roles?id=${editRoleId}`, payload)
        toast.success('Role updated')
      } else {
        await axios.post('/api/roles', payload)
        toast.success('Role created')
      }
      await loadData()
      resetRoleForm()
    } catch (e) {
      toast.error('Operation failed')
    }
  }

  const savePermission = async () => {
    if (!permForm.name) {
      toast.error('Name is required')
      return
    }

    try {
      await axios.post('/api/permissions', { name: permForm.name })
      toast.success('Permission created')
      setPermForm({ name: '' })
      await loadData()
    } catch (e) {
      toast.error('Operation failed')
    }
  }

  const deleteRole = async (id: number) => {
    if (!confirm('Are you sure?')) return

    try {
      await axios.delete(`/api/roles?id=${id}`)
      toast.success('Role deleted')
      await loadData()
    } catch (e) {
      toast.error('Delete failed')
    }
  }

  const deletePermission = async (perm: string) => {
    if (!confirm('Are you sure?')) return

    try {
      await axios.delete(`/api/permissions?name=${encodeURIComponent(perm)}`)
      toast.success('Permission deleted')
      await loadData()
    } catch (e) {
      toast.error('Delete failed')
    }
  }

  const startRoleEdit = (role: Role) => {
    setEditRoleId(role.id)
    setRoleForm({
      name: role.name,
      description: role.description || '',
      permissions: Object.entries(role.permissions)
        .filter(([_, enabled]) => enabled)
        .map(([perm]) => perm)
    })
  }

  const resetRoleForm = () => {
    setEditRoleId(null)
    setRoleForm({
      name: '',
      description: '',
      permissions: []
    })
  }

  if (!session) {
    return null // Redirecting, so no need to render
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    
      
      <main className="flex-1 p-4 md:p-8 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Role & Permission Management</h1>
            <p className="text-gray-600">Create and manage roles with specific permissions</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Role Creation/Edit Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-800">
                  {editRoleId ? 'Edit Role' : 'Create New Role'}
                </h2>
                {editRoleId && (
                  <button 
                    onClick={resetRoleForm}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <input
                    className="w-full px-3 py-2.5 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Admin, Editor, etc."
                    value={roleForm.name}
                    onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2.5 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Describe this role..."
                    rows={2}
                    value={roleForm.description}
                    onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 border border-gray-200 rounded-lg">
                    {permissions.map((p, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          id={`perm-${index}`}
                          type="checkbox"
                          checked={roleForm.permissions.includes(p)}
                          onChange={() => handlePermissionToggle(p)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor={`perm-${index}`} className="ml-2 text-sm text-gray-700 truncate">
                          {p}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={saveRole}
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editRoleId ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </div>

            {/* Permission Management Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-5">Manage Permissions</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Create New Permission</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 px-3 py-2.5 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="e.g., manage_users, view_reports"
                      value={permForm.name}
                      onChange={e => setPermForm({ name: e.target.value })}
                    />
                    <button
                      onClick={savePermission}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-800">Available Permissions</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {permissions.length} permissions
                    </span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {permissions.length > 0 ? (
                      permissions.map((perm, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <span className="font-medium text-gray-800 text-sm">{perm}</span>
                          <button
                            onClick={() => deletePermission(perm)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-full hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No permissions created yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Roles List */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">Roles</h2>
              <span className="text-sm bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full">
                {roles.length} roles
              </span>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : roles.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-gray-100 p-4 rounded-lg inline-block mb-4">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">No roles found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Create your first role to get started. Roles help you manage permissions for different user types.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {roles.map(role => (
                  <div key={role.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-indigo-800">{role.name.charAt(0)}</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">{role.name}</h3>
                            {role.description && (
                              <p className="text-gray-600 text-sm mt-1">{role.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="text-xs font-medium text-gray-500 mb-1">PERMISSIONS</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(role.permissions).some(([_, enabled]) => enabled) ? (
                              Object.entries(role.permissions).map(([perm, enabled]) => (
                                enabled && (
                                  <span key={perm} className="bg-indigo-50 text-indigo-700 px-3 py-1 text-xs rounded-full">
                                    {perm}
                                  </span>
                                )
                              ))
                            ) : (
                              <span className="text-gray-500 text-sm">No permissions assigned</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => startRoleEdit(role)}
                          className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="text-sm font-medium">Edit</span>
                        </button>
                        <button
                          onClick={() => deleteRole(role.id)}
                          className="flex items-center gap-1.5 text-red-600 hover:text-red-800 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="text-sm font-medium">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}