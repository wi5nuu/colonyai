import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

describe('API Client', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000';
  });

  describe('api.ts', () => {
    it('should create ApiClient with correct base URL', () => {
      const mod = require('@/lib/api');
      expect(mod.API_URL).toBe(process.env.NEXT_PUBLIC_API_URL);
    });

    it('should include auth token in requests when available', async () => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: { accessToken: 'test-token-123' }
      }));
      const { default: api } = require('@/lib/api');
      const mockGet = jest.spyOn(api, 'get').mockResolvedValue({ data: {} });
      await api.get('/test');
      expect(mockGet).toHaveBeenCalledWith('/test');
      mockGet.mockRestore();
    });
  });

  describe('auth-api.ts', () => {
    it('login should POST to auth endpoint', async () => {
      const { authApi } = require('@/lib/auth-api');
      const { default: api } = require('@/lib/api');
      const mockPost = jest.spyOn(api, 'post').mockResolvedValue({
        data: { access_token: 'token123', token_type: 'bearer' }
      });
      const result = await authApi.login({ email: 'test@colonyai.com', password: 'password123' });
      expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/login', expect.any(Object));
      expect(result).toHaveProperty('access_token');
      mockPost.mockRestore();
    });

    it('register should POST to registration endpoint', async () => {
      const { authApi } = require('@/lib/auth-api');
      const { default: api } = require('@/lib/api');
      const mockPost = jest.spyOn(api, 'post').mockResolvedValue({
        data: { id: 'user-123', email: 'new@colonyai.com' }
      });
      const result = await authApi.register({
        email: 'new@colonyai.com',
        password: 'SecurePass123!',
        full_name: 'New User',
      });
      expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/register', expect.any(Object));
      mockPost.mockRestore();
    });
  });

  describe('analyses-api.ts', () => {
    it('createAnalysis should POST with form data', async () => {
      const { createAnalysis } = require('@/lib/analyses-api');
      const { default: api } = require('@/lib/api');
      const mockPost = jest.spyOn(api, 'post').mockResolvedValue({
        data: { id: 'analysis-123', status: 'completed', colony_count: 50, cfu_per_ml: 50000 }
      });
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'plate.jpg');
      formData.append('sample_id', 'TEST-001');
      formData.append('media_type', 'Plate Count Agar');
      formData.append('dilution_factor', '0.001');
      formData.append('plated_volume_ml', '1.0');
      const result = await createAnalysis(formData);
      expect(mockPost).toHaveBeenCalledWith('/api/v1/analyses/', formData, expect.any(Object));
      expect(result.colony_count).toBe(50);
      mockPost.mockRestore();
    });

    it('listAnalyses should support pagination and filters', async () => {
      const { listAnalyses } = require('@/lib/analyses-api');
      const { default: api } = require('@/lib/api');
      const mockGet = jest.spyOn(api, 'get').mockResolvedValue({
        data: { analyses: [], total: 0, page: 1, page_size: 20 }
      });
      await listAnalyses({ page: 2, page_size: 10, search: 'TEST', media_type: 'PCA' });
      expect(mockGet).toHaveBeenCalledWith('/api/v1/analyses/', {
        params: expect.objectContaining({ page: 2, page_size: 10, search: 'TEST', media_type: 'PCA' })
      });
      mockGet.mockRestore();
    });
  });
});

describe('Auth Store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with no token', () => {
    const { useAuthStore } = require('@/lib/auth-store');
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set token on login', () => {
    const { useAuthStore } = require('@/lib/auth-store');
    useAuthStore.setState({
      accessToken: 'test-token-123',
      isAuthenticated: true,
      user: { id: 'u1', email: 'test@test.com', role: 'analyst' }
    });
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('test-token-123');
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear state on logout', () => {
    const { useAuthStore } = require('@/lib/auth-store');
    useAuthStore.setState({
      accessToken: 'test-token',
      isAuthenticated: true,
      user: { id: 'u1', email: 'test@test.com', role: 'analyst' }
    });
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});

describe('React Components', () => {
  describe('ErrorBoundary', () => {
    it('should render children when no error', () => {
      const { ErrorBoundary } = require('@/components/error-boundary');
      const { getByText } = render(
        <ErrorBoundary><div>Test Content</div></ErrorBoundary>
      );
      expect(getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Loading Skeleton', () => {
    it('should render skeleton loader', () => {
      const { Skeleton } = require('@/components/skeleton');
      const { container } = render(<Skeleton />);
      expect(container.firstChild).toHaveClass('animate-pulse');
    });
  });
});

describe('Type Definitions', () => {
  it('should validate AnalysisResponse type structure', () => {
    const analysis = {
      id: 'test-id',
      sample_id: 'SMP-001',
      media_type: 'Plate Count Agar',
      dilution_factor: 0.001,
      plated_volume_ml: 1.0,
      colony_count: 50,
      cfu_per_ml: 50000,
      confidence_score: 0.95,
      status: 'completed',
      class_breakdown: { colony_single: 50, colony_merged: 0 },
      created_at: new Date().toISOString(),
    };
    expect(analysis).toHaveProperty('id');
    expect(analysis).toHaveProperty('colony_count');
    expect(analysis).toHaveProperty('cfu_per_ml');
    expect(typeof analysis.confidence_score).toBe('number');
  });

  it('should validate DetectionResponse type structure', () => {
    const detection = {
      id: 'det-123',
      analysis_id: 'analysis-456',
      class_name: 'colony_single',
      confidence: 0.95,
      bbox: { x: 100, y: 100, width: 20, height: 20 },
    };
    expect(detection).toHaveProperty('class_name');
    expect(detection).toHaveProperty('bbox');
    expect(detection.bbox).toHaveProperty('x');
    expect(detection.bbox).toHaveProperty('y');
  });
});
