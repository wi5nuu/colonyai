'use client'

import { Toaster } from 'sonner'
import { AuthGuard } from '@/lib/auth-guard'
import { ThemeProvider } from '@/components/ThemeProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthGuard>
        {children}
      </AuthGuard>
      <Toaster position="top-right" richColors closeButton />
    </ThemeProvider>
  )
}
