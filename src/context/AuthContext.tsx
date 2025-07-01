// src/components/context/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

type User = {
  id: string
  name: string
  email: string
  role?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      if (status === 'authenticated') {
        try {
          const res = await fetch('/api/user/profile')
          if (!res.ok) throw new Error('Failed to fetch user')
          const data = await res.json()
          setUser(data)
        } catch (err) {
          console.error('Error loading user:', err)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    fetchUser()
  }, [status])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
