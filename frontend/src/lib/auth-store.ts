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
  tempEmail: string | null
  loginStep: 'credentials' | 'mfa'
  setLoginStep: (step: 'credentials' | 'mfa') => void

  login: (email: string, password: string) => Promise<any>
  register: (email: string, password: string, fullName: string, role?: string) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<void>
  verifyMfa: (code: string, trustDevice: boolean) => Promise<void>
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
      tempEmail: null,
      loginStep: 'credentials',
      setLoginStep: (step) => set({ loginStep: step }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // Get or generate Device ID
          let deviceId = localStorage.getItem('colony_device_id')
          if (!deviceId) {
            deviceId = crypto.randomUUID()
            localStorage.setItem('colony_device_id', deviceId)
          }

          const data = await authApi.login({ email, password, device_id: deviceId })
          console.log("Raw Backend Login Data:", data);

          if (data.mfa_required) {
            console.log("MFA is required according to backend");
            set({ isLoading: false, error: null, tempEmail: email, loginStep: 'mfa' })
            return { mfa_required: true }
          }

          set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            user: data.user ? { ...data.user, role: data.user.role.toLowerCase() } : null,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          })
          return { mfa_required: false }
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

      verifyMfa: async (code: string, trustDevice: boolean) => {
        set({ isLoading: true, error: null })
        const { tempEmail } = get()
        
        if (!tempEmail) {
          set({ isLoading: false, error: 'Session expired' })
          throw new Error('Session expired')
        }

        try {
          const deviceId = localStorage.getItem('colony_device_id') || ""
          const data = await authApi.verifyMfa({
            email: tempEmail,
            code,
            device_id: deviceId,
            trust_device: trustDevice
          })

          set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            user: data.user ? { ...data.user, role: data.user.role.toLowerCase() } : null,
            isLoading: false,
            isAuthenticated: true,
            tempEmail: null,
            error: null,
          })
          
          if (trustDevice) {
            toast.success('Device registered as trusted for 30 days')
          }
        } catch (error: any) {
          const errorMsg = error.response?.data?.detail || error.message || 'Verification Failed'
          toast.error(errorMsg)
          set({
            isLoading: false,
            error: errorMsg
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
