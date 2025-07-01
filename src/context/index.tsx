'use client'

import { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { ProductProvider } from './ProductContext'
import { RoleProvider } from './role-context'
import { UserProvider } from './user-context'

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <RoleProvider>
          <ProductProvider>
            {children}
          </ProductProvider>
        </RoleProvider>
      </UserProvider>
    </AuthProvider>
  )
}
