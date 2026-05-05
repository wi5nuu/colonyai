import api from './api';
import {
  Analysis,
  AnalysisListResponse,
  AnalysisCreate,
  MediaType,
} from './types';

export const analysesApi = {
  create: async (data: AnalysisCreate): Promise<Analysis> => {
    const formData = new FormData();
    formData.append('file', data.image);
    formData.append('sample_id', data.sample_id);
    formData.append('media_type', data.media_type);
    formData.append('dilution_factor', data.dilution_factor.toString());
    formData.append('plated_volume_ml', data.plated_volume_ml.toString());
    if (data.incubation_temp !== undefined) formData.append('incubation_temp', data.incubation_temp.toString());
    if (data.incubation_time_hours !== undefined) formData.append('incubation_time_hours', data.incubation_time_hours.toString());
    if (data.method_standard !== undefined) formData.append('method_standard', data.method_standard);
    if (data.media_batch_number !== undefined) formData.append('media_batch_number', data.media_batch_number);
    if (data.incubator_id !== undefined) formData.append('incubator_id', data.incubator_id);

    const response = await api.post<Analysis>('/api/v1/analyses', formData);
    return response.data;
  },

  list: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    media_type?: MediaType;
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<AnalysisListResponse> => {
    const response = await api.get<AnalysisListResponse>('/api/v1/analyses', {
      params: {
        page: params?.page || 1,
        page_size: params?.page_size || 20,
        search: params?.search,
        media_type: params?.media_type,
        status: params?.status,
        date_from: params?.date_from,
        date_to: params?.date_to,
      },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Analysis> => {
    const response = await api.get<Analysis>(`/api/v1/analyses/${id}`);
    return response.data;
  },

  getResult: async (id: string): Promise<Analysis> => {
    const response = await api.get<Analysis>(`/api/v1/analyses/${id}/result`);
    return response.data;
  },

  approve: async (id: string): Promise<Analysis> => {
    const response = await api.post<Analysis>(`/api/v1/analyses/${id}/approve`);
    return response.data;
  },

  flagForReview: async (id: string, reason: string): Promise<Analysis> => {
    const response = await api.post<Analysis>(`/api/v1/analyses/${id}/review`, {
      reason,
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/analyses/${id}`);
  },

  syncToLims: async (id: string): Promise<any> => {
    const response = await api.post(`/api/v1/lims/sync/${id}`);
    return response.data;
  },

  getLimsLogs: async (limit: number = 50): Promise<any[]> => {
    const response = await api.get('/api/v1/lims/logs', { params: { limit } });
    return response.data as any[];
  },
};
