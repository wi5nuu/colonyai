import api from './api';
import { LoginRequest, RegisterRequest, AuthResponse, User, MFAVerifyRequest } from './types';

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/v1/auth/login', data);
    return response.data;
  },

  verifyMfa: async (data: MFAVerifyRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/v1/auth/verify-mfa', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/v1/auth/register', data);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/v1/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/v1/users/me');
    return response.data;
  },

  updateProfile: async (data: { full_name?: string }): Promise<User> => {
    const response = await api.patch<User>('/api/v1/users/me', data);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/api/v1/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/api/v1/auth/reset-password', data);
    return response.data;
  },
};
