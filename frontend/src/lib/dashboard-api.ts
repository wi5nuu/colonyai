import api from './api';
import { DashboardStats } from './types';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/api/v1/analyses/stats');
    return response.data;
  },
};
