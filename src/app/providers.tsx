'use client'
import { AppContextProvider } from '@/context/index'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppContextProvider>
      {children}
    </AppContextProvider>
  )
}

