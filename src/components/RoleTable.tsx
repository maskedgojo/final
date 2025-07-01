'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useRoleContext } from '@/context/role-context'
import TableSkeleton from '@/components/ui/TableSkeleton' 

type Role = {
  id: number
  name: string
  description?: string
  permissions: Record<string, boolean>
}

export default function RoleTablePage() {
  const router = useRouter()
  const { roles, loading, refreshRoles } = useRoleContext()

  const [allPermissions, setAllPermissions] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    selectedPermissions: [] as string[]
  })
  const [editId, setEditId] = useState<number | null>(null)

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const res = await axios.get('/api/permissions')
        setAllPermissions(res.data)
      } catch (error) {
        toast.error('Failed to load permissions')
      }
    }

    loadPermissions()
  }, [])

  const filteredRoles = useMemo(() => {
    if (!searchValue.trim()) return roles
    const lower = searchValue.toLowerCase()
    return roles.filter(r =>
      r.name.toLowerCase().includes(lower) ||
      r.description?.toLowerCase()?.includes(lower) ||
      Object.keys(r.permissions).some(p => r.permissions[p] && p.toLowerCase().includes(lower))
    )
  }, [roles, searchValue])

  const handleSave = async () => {
    if (!form.name) {
      toast.error('Role name required')
      return
    }

    try {
      const payload = {
        name: form.name,
        description: form.description,
        permissions: Object.fromEntries(
          form.selectedPermissions.map(p => [p, true])
        )
      }

      if (editId) {
        await axios.put(`/api/roles?id=${editId}`, payload)
        toast.success('Role updated!')
      } else {
        await axios.post('/api/roles', payload)
        toast.success('Role created!')
      }

      await refreshRoles()
      setForm({ name: '', description: '', selectedPermissions: [] })
      setEditId(null)
    } catch (error) {
      toast.error('Save failed')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return
    try {
      await axios.delete(`/api/roles?id=${id}`)
      toast.success('Role deleted')
      await refreshRoles()
      if (editId === id) {
        setForm({ name: '', description: '', selectedPermissions: [] })
        setEditId(null)
      }
    } catch (error) {
      toast.error('Delete failed')
    }
  }

if (loading) {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Role Management</h1>
      <TableSkeleton rows={6} columns={4} />
    </div>
  )
}

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Role Management</h1>

      <input
        type="text"
        placeholder="Search roles..."
        className="w-full border rounded px-3 py-2 mb-6"
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
      />

      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded mb-4"
        onClick={() => {
          setEditId(null)
          setForm({ name: '', description: '', selectedPermissions: [] })
        }}
      >
        Add New Role
      </button>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4">
          {editId ? 'Edit Role' : 'Create New Role'}
        </h2>
        <input
          className="border w-full p-2 mb-3"
          placeholder="Role Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <textarea
          className="border w-full p-2 mb-3"
          placeholder="Description"
          rows={2}
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Permissions</label>
          <div className="flex flex-wrap gap-2">
            {allPermissions.map(permission => (
              <label key={permission} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.selectedPermissions.includes(permission)}
                  onChange={() => {
                    setForm(prev => ({
                      ...prev,
                      selectedPermissions: prev.selectedPermissions.includes(permission)
                        ? prev.selectedPermissions.filter(p => p !== permission)
                        : [...prev.selectedPermissions, permission]
                    }))
                  }}
                  className="h-4 w-4 text-indigo-600"
                />
                <span className="text-gray-800 text-sm">{permission}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleSave}
          >
            {editId ? 'Update Role' : 'Create Role'}
          </button>
          {editId && (
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
              onClick={() => {
                setEditId(null)
                setForm({ name: '', description: '', selectedPermissions: [] })
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Description</th>
              <th className="text-left p-3">Permissions</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
    [...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse border-t">
        <td className="p-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
        <td className="p-3"><div className="h-4 bg-gray-200 rounded w-4/5" /></td>
        <td className="p-3"><div className="h-4 bg-gray-200 rounded w-1/2" /></td>
        <td className="p-3"><div className="h-4 bg-gray-200 rounded w-2/3" /></td>
      </tr>
    ))
  ) :filteredRoles.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  {roles.length === 0 ? 'No roles found' : 'No matching roles found'}
                </td>
              </tr>
            ) : (
              filteredRoles.map(role => (
                <tr key={role.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{role.name}</td>
                  <td className="p-3 text-gray-600">{role.description || '-'}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(role.permissions).map(([perm, enabled]) =>
                        enabled ? (
                          <span
                            key={perm}
                            className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded"
                          >
                            {perm}
                          </span>
                        ) : null
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          setEditId(role.id)
                          setForm({
                            name: role.name,
                            description: role.description || '',
                            selectedPermissions: Object.entries(role.permissions)
                              .filter(([_, enabled]) => enabled)
                              .map(([perm]) => perm)
                          })
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(role.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
