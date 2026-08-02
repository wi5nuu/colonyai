const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

// Simple API client that mimics axios interface
class ApiClient {
  private baseUrl: string
  private isRefreshing = false
  private refreshSubscribers: ((token: string) => void)[] = []

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token))
    this.refreshSubscribers = []
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback)
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T }> {
    const url = `${this.baseUrl}${endpoint}`
    
    // Get auth token if available
    let authToken: string | null = null
    if (typeof window !== 'undefined') {
      try {
        const authStorage = localStorage.getItem('auth-storage')
        if (authStorage) {
          const parsed = JSON.parse(authStorage)
          authToken = parsed.state?.accessToken || null
        }
      } catch (e) {
        // Ignore storage access errors
      }
    }

    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    }

    // Don't set Content-Type for FormData - browser will set it with boundary
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle 401 Unauthorized - Attempt Token Refresh
    if (response.status === 401 && authToken && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      if (!this.isRefreshing) {
        this.isRefreshing = true
        
        try {
          // Import useAuthStore dynamically to avoid circular dependency
          const { useAuthStore } = await import('./auth-store')
          const refreshSuccess = await useAuthStore.getState().refreshAccessToken()
          
          this.isRefreshing = false
          
          // Re-fetch the new token (SSR-safe)
          let newToken: string | null = null
          if (typeof window !== 'undefined') {
            const authStorage = localStorage.getItem('auth-storage')
            newToken = authStorage ? JSON.parse(authStorage).state?.accessToken : null
          }
          
          if (newToken) {
            this.onTokenRefreshed(newToken)
            // Retry the original request
            return this.request<T>(endpoint, {
              ...options,
              headers: {
                ...headers,
                'Authorization': `Bearer ${newToken}`
              }
            })
          }
        } catch (refreshError) {
          this.isRefreshing = false
          this.refreshSubscribers = []
          throw refreshError
        }
      } else {
        // Wait for current refresh to complete - prevent race condition
        return new Promise((resolve, reject) => {
          this.addRefreshSubscriber((newToken) => {
            this.request<T>(endpoint, {
              ...options,
              headers: {
                ...headers,
                'Authorization': `Bearer ${newToken}`
              }
            }).then(resolve).catch(reject)
          })
        })
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }))
      
      interface ApiError extends Error {
        response?: {
          data: Record<string, unknown>
          status: number
        }
      }
      
      const apiError = new Error(error.detail || `HTTP ${response.status}`) as ApiError
      apiError.response = { data: error, status: response.status }
      throw apiError
    }

    // Handle no-content responses
    if (response.status === 204) {
      return { data: null as T }
    }

    const data = await response.json()
    return { data }
  }

  async get<T>(endpoint: string, config?: { params?: Record<string, any> }): Promise<{ data: T }> {
    // Build query string if params provided
    let url = endpoint
    if (config?.params) {
      const queryParams = new URLSearchParams()
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
      const queryString = queryParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }
    return this.request<T>(url, { method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any, config?: { headers?: Record<string, string> }): Promise<{ data: T }> {
    const options: RequestInit = {
      method: 'POST',
      headers: config?.headers || {},
    }
    
    if (body instanceof FormData) {
      options.body = body
    } else if (body) {
      options.body = JSON.stringify(body)
    }
    
    return this.request<T>(endpoint, options)
  }

  async put<T>(endpoint: string, body?: unknown): Promise<{ data: T }> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<{ data: T }> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<{ data: T }> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create and export default instance
const api = new ApiClient(API_URL)
export default api

// Also export named utilities for direct use
export { API_URL }
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string; success: boolean }> {
  try {
    const result = await api.request<T>(endpoint, options)
    return { success: true, data: result.data }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error' }
  }
}

export async function apiGet<T = any>(endpoint: string) {
  return api.get<T>(endpoint)
}

export async function apiPost<T = unknown>(endpoint: string, body?: unknown) {
  return api.post<T>(endpoint, body)
}

export async function apiPut<T = unknown>(endpoint: string, body?: unknown) {
  return api.put<T>(endpoint, body)
}

export async function apiDelete<T = any>(endpoint: string) {
  return api.delete<T>(endpoint)
}

