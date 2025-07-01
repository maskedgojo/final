'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import axios from 'axios'

// User Type
export interface User {
  id: number
  name: string
  email: string
  dob: string
  address: string
  userRoles: { role: { name: string } }[]
}

// Context Type
interface UserContextType {
  user: User | null
  loading: boolean
  error: string | null
  refetchUser: () => void
}

// Create Context
export const UserContext = createContext<UserContextType | undefined>(undefined)

// Provider
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/user/profile')
      setUser(res.data)
      setError(null)
    } catch (err: unknown) {
      setUser(null)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to fetch user')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, error, refetchUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  )
}

// ✅ Custom hook for easy access
export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
