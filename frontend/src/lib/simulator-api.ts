import api from './api';

export interface SimulatorComparison {
  id: string;
  analysis_id: string;
  ai_class_breakdown: Record<string, number>;
  ai_total_valid: number;
  manual_colony_single: number;
  manual_colony_merged: number;
  manual_bubble: number;
  manual_dust_debris: number;
  manual_media_crack: number;
  manual_total_valid: number;
  agreement_single: number;
  agreement_merged: number;
  agreement_bubble: number;
  agreement_dust_debris: number;
  agreement_media_crack: number;
  overall_accuracy: number;
  notes?: string;
  created_at: string;
}

export interface SimulatorStats {
  total_comparisons: number;
  avg_overall_accuracy: number;
  min_accuracy: number;
  max_accuracy: number;
  avg_agreement_per_class: Record<string, number>;
}

export const simulatorApi = {
  saveComparison: async (data: {
    analysis_id: string;
    manual_colony_single: number;
    manual_colony_merged: number;
    manual_bubble: number;
    manual_dust_debris: number;
    manual_media_crack: number;
    notes?: string;
    // Sandbox mode: send AI data when simulation is transient (not in DB)
    ai_class_breakdown?: Record<string, number>;
    ai_total_valid?: number;
    overall_accuracy?: number;
  }): Promise<SimulatorComparison> => {
    const response = await api.post<SimulatorComparison>('/api/v1/simulator', data);
    return response.data;
  },

  getComparison: async (analysisId: string): Promise<SimulatorComparison | null> => {
    const response = await api.get<SimulatorComparison | null>(`/api/v1/simulator/analysis/${analysisId}`);
    return response.data;
  },

  listComparisons: async (page = 1, pageSize = 20) => {
    const response = await api.get('/api/v1/simulator', { params: { page, page_size: pageSize } });
    return response.data;
  },

  getStats: async (): Promise<SimulatorStats> => {
    const response = await api.get<SimulatorStats>('/api/v1/simulator/stats');
    return response.data;
  },
};
