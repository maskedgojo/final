// src/components/context/role-context.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import axios from 'axios'

export type Role = {
  id: string
  name: string
}

type RoleContextType = {
  roles: Role[]
  loading: boolean
  refreshRoles: () => Promise<void>
}

const RoleContext = createContext<RoleContextType>({
  roles: [],
  loading: true,
  refreshRoles: async () => {},
})

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  const refreshRoles = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/roles') // 🔁 make sure this API route exists
      setRoles(res.data)
    } catch (err) {
      console.error('Failed to fetch roles:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshRoles()
  }, [])

  return (
    <RoleContext.Provider value={{ roles, loading, refreshRoles }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRoleContext = () => useContext(RoleContext)
