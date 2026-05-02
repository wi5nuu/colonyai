import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'
import { authApi } from './auth-api'

interface User {
  id: string
  email: string
  full_name?: string
  role: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean

  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string, role?: string) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const data = await authApi.login({ email, password })

          set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            user: data.user || null,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          })
        } catch (error: any) {
          const errorMsg = error.response?.data?.detail || error.message || 'Access Denied'
          toast.error(errorMsg)
          set({
            isLoading: false,
            error: errorMsg,
            isAuthenticated: false,
          })
          throw error
        }
      },

      register: async (email: string, password: string, fullName: string, role?: string) => {
        set({ isLoading: true, error: null })
        try {
          const data = await authApi.register({
            email,
            password,
            full_name: fullName,
            role: (role as any) || 'analyst',
          })

          toast.success('Laboratory Node Provisioned Successfully')
          set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            user: data.user || null,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          })
        } catch (error: any) {
          const errorMsg = error.response?.data?.detail || error.message || 'Provisioning Failed'
          toast.error(errorMsg)
          set({
            isLoading: false,
            error: errorMsg,
            isAuthenticated: false,
          })
          throw error
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          toast.info('Laboratory Session Terminated')
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            error: null,
            isAuthenticated: false,
          })
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken: refreshTok } = get()
        
        if (!refreshTok) {
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
          return
        }

        try {
          const data = await authApi.refresh(refreshTok)

          set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            user: data.user || get().user,
            isLoading: false,
            isAuthenticated: true
          })
        } catch (error) {
          console.error('Token refresh failed:', error)
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            isAuthenticated: false,
          })
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)



