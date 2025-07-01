'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import axios from 'axios'

// Define user type
export interface User {
  id: number
  name: string
  email: string
  dob: string
  address: string
  userRoles: { role: { id: number; name: string } }[]
}

// Define context shape
interface UsersContextType {
  users: User[]
  loading: boolean
  error: string | null
  refetchUsers: () => void
}

// Create context
const UsersContext = createContext<UsersContextType | undefined>(undefined)

// Provider
export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/users') // Make sure this API exists
      setUsers(res.data)
      setError(null)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to fetch users')
      }
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <UsersContext.Provider
      value={{
        users,
        loading,
        error,
        refetchUsers: fetchUsers
      }}
    >
      {children}
    </UsersContext.Provider>
  )
}

// ✅ Correct hook name
export const useUsersContext = () => {
  const context = useContext(UsersContext)
  if (!context) {
    throw new Error('useUsersContext must be used within a UsersProvider')
  }
  return context
}
