import api from './api';
import { ReportRequest, ReportResponse } from './types';

export const reportsApi = {
  generatePdf: async (data: ReportRequest): Promise<ReportResponse> => {
    const response = await api.post<ReportResponse>('/api/v1/reports/pdf', data);
    return response.data;
  },

  generateCsv: async (data: ReportRequest): Promise<ReportResponse> => {
    const response = await api.post<ReportResponse>('/api/v1/reports/csv', data);
    return response.data;
  },

  downloadReport: async (reportId: string, filename?: string): Promise<void> => {
    let authToken = null;
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) authToken = JSON.parse(authStorage).state?.accessToken;
    } catch (e) {}

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${API_URL}/api/v1/reports/${reportId}/download`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    });

    if (!response.ok) throw new Error('Failed to download report');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `colonyai-report-${reportId}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
