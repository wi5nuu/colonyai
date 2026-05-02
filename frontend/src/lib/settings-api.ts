/**
 * Settings API Client
 * 
 * Interfaces with ColonyAI backend settings endpoints for
 * user preferences, notifications, laboratory defaults, and appearance.
 */

import api from './api'

export interface UserPreferences {
  notifications: {
    analysis_complete: boolean
    boundary_alerts: boolean
    weekly_summary: boolean
  }
  laboratory: {
    lab_name: string
    default_media: string
    default_volume: number
  }
  appearance: {
    theme: string
    language: string
  }
  updated_at: string
}

export const settingsApi = {
  /**
   * Get all user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    const response = await api.get<UserPreferences>('/api/v1/settings/preferences')
    return response.data
  },

  /**
   * Update notification preferences
   */
  async updateNotifications(data: {
    analysis_complete: boolean
    boundary_alerts: boolean
    weekly_summary: boolean
  }) {
    const response = await api.put<any>('/api/v1/settings/notifications', data)
    return response.data
  },

  /**
   * Update laboratory default configuration
   */
  async updateLaboratory(data: {
    lab_name: string
    default_media: string
    default_volume: number
  }) {
    const response = await api.put<any>('/api/v1/settings/laboratory', data)
    return response.data
  },

  /**
   * Update appearance and language preferences
   */
  async updateAppearance(data: {
    theme: string
    language: string
  }) {
    const response = await api.put<any>('/api/v1/settings/appearance', data)
    return response.data
  },

  /**
   * Change user password
   */
  async changePassword(data: {
    current_password: string
    new_password: string
  }) {
    const response = await api.put<any>('/api/v1/auth/password', data)
    return response.data
  },

  /**
   * Get active sessions
   */
  async getSessions() {
    const response = await api.get<any>('/api/v1/auth/sessions')
    return response.data
  },

  /**
   * Revoke all active sessions (logout from all devices)
   */
  async revokeAllSessions() {
    const response = await api.delete<any>('/api/v1/auth/sessions/all')
    return response.data
  }
}
