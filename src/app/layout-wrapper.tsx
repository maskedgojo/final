// src/app/layout-wrapper.tsx
'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { AppContextProvider } from '@/context'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppContextProvider>
        {children}
        <Toaster position="top-right" />
      </AppContextProvider>
    </SessionProvider>
  )
}
