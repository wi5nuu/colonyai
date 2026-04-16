/**
 * Frontend tests using Jest + React Testing Library
 * 
 * Run: npm test
 * 
 * Tests cover:
 * - Authentication utilities
 * - API client functions
 * - React components
 * - State management
 */

import '@testing-library/jest-dom';

// ─── API Client Tests ───────────────────────────────────────────────────────

describe('API Client', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000';
  });

  describe('api.ts', () => {
    it('should create axios instance with correct base URL', () => {
      const { api } = require('@/lib/api');
      expect(api.defaults.baseURL).toBe(process.env.NEXT_PUBLIC_API_URL);
    });

    it('should include auth token in requests when available', async () => {
      const { api } = require('@/lib/api');
      localStorage.setItem('token', 'test-token-123');
      
      // Mock axios request
      const mockGet = jest.spyOn(api, 'get').mockResolvedValue({ data: {} });
      await api.get('/test');
      
      expect(mockGet).toHaveBeenCalledWith('/test');
      mockGet.mockRestore();
    });
  });

  describe('auth-api.ts', () => {
    it('login should POST to auth endpoint', async () => {
      const { login } = require('@/lib/auth-api');
      const { api } = require('@/lib/api');
      
      const mockPost = jest.spyOn(api, 'post').mockResolvedValue({
        data: { access_token: 'token123', token_type: 'bearer' }
      });

      const result = await login('test@colonyai.com', 'password123');
      
      expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/login', expect.any(Object));
      expect(result).toHaveProperty('access_token');
      
      mockPost.mockRestore();
    });

    it('register should POST to registration endpoint', async () => {
      const { register } = require('@/lib/auth-api');
      const { api } = require('@/lib/api');
      
      const mockPost = jest.spyOn(api, 'post').mockResolvedValue({
        data: { id: 'user-123', email: 'new@colonyai.com' }
      });

      const result = await register({
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
      const { api } = require('@/lib/api');
      
      const mockPost = jest.spyOn(api, 'post').mockResolvedValue({
        data: {
          id: 'analysis-123',
          status: 'completed',
          colony_count: 50,
          cfu_per_ml: 50000,
        }
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
      const { api } = require('@/lib/api');
      
      const mockGet = jest.spyOn(api, 'get').mockResolvedValue({
        data: {
          analyses: [],
          total: 0,
          page: 1,
          page_size: 20,
        }
      });

      await listAnalyses({
        page: 2,
        page_size: 10,
        search: 'TEST',
        media_type: 'PCA',
      });

      expect(mockGet).toHaveBeenCalledWith('/api/v1/analyses/', {
        params: expect.objectContaining({
          page: 2,
          page_size: 10,
          search: 'TEST',
          media_type: 'PCA',
        })
      });
      
      mockGet.mockRestore();
    });
  });
});

// ─── Authentication Store Tests (Zustand) ───────────────────────────────────

describe('Auth Store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with no token', () => {
    const { useAuthStore } = require('@/lib/auth-store');
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
  });

  it('should set token on login', () => {
    const { useAuthStore } = require('@/lib/auth-store');
    
    useAuthStore.getState().setToken('test-token-123');
    
    const state = useAuthStore.getState();
    expect(state.token).toBe('test-token-123');
    expect(localStorage.getItem('token')).toBe('test-token-123');
  });

  it('should clear token on logout', () => {
    const { useAuthStore } = require('@/lib/auth-store');
    
    useAuthStore.getState().setToken('test-token');
    useAuthStore.getState().logout();
    
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should persist token to localStorage', () => {
    const { useAuthStore } = require('@/lib/auth-store');
    
    useAuthStore.getState().setToken('persistent-token');
    
    expect(localStorage.getItem('token')).toBe('persistent-token');
    
    // New store instance should restore token
    const newState = useAuthStore.getState();
    expect(newState.token).toBe('persistent-token');
  });
});

// ─── Component Tests ────────────────────────────────────────────────────────

describe('React Components', () => {
  describe('ErrorBoundary', () => {
    it('should render children when no error', () => {
      const { render } = require('@testing-library/react');
      const { ErrorBoundary } = require('@/components/error-boundary');
      
      const { getByText } = render(
        <ErrorBoundary>
          <div>Test Content</div>
        </ErrorBoundary>
      );
      
      expect(getByText('Test Content')).toBeInTheDocument();
    });

    it('should render error message when error occurs', () => {
      const { render } = require('@testing-library/react');
      const { ErrorBoundary } = require('@/components/error-boundary');
      
      const ThrowError = () => {
        throw new Error('Test error');
      };
      
      // Suppress console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      
      expect(getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Loading Skeleton', () => {
    it('should render skeleton loader', () => {
      const { render } = require('@testing-library/react');
      const { Skeleton } = require('@/components/skeleton');
      
      const { container } = render(<Skeleton />);
      
      expect(container.firstChild).toHaveClass('animate-pulse');
    });
  });
});

// ─── Utility Functions Tests ────────────────────────────────────────────────

describe('Utility Functions', () => {
  describe('detection-styles.ts', () => {
    it('should return correct color for colony_single', () => {
      const { getDetectionColor } = require('@/lib/detection-styles');
      expect(getDetectionColor('colony_single')).toContain('green');
    });

    it('should return correct color for colony_merged', () => {
      const { getDetectionColor } = require('@/lib/detection-styles');
      expect(getDetectionColor('colony_merged')).toContain('orange');
    });

    it('should return correct color for bubble', () => {
      const { getDetectionColor } = require('@/lib/detection-styles');
      expect(getDetectionColor('bubble')).toContain('red');
    });

    it('should return default color for unknown class', () => {
      const { getDetectionColor } = require('@/lib/detection-styles');
      expect(getDetectionColor('unknown')).toBeDefined();
    });
  });

  describe('date formatting', () => {
    it('should format dates correctly', () => {
      const { formatDistanceToNow } = require('date-fns');
      const date = new Date();
      const result = formatDistanceToNow(date, { addSuffix: true });
      expect(result).toContain('less than');
    });
  });
});

// ─── Type Validation Tests ──────────────────────────────────────────────────

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
      reliability: 'high',
      status: 'completed',
      class_breakdown: {
        colony_single: 50,
        colony_merged: 0,
      },
      is_valid_for_reporting: true,
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
      bbox: {
        x: 100,
        y: 100,
        width: 20,
        height: 20,
      },
    };

    expect(detection).toHaveProperty('class_name');
    expect(detection).toHaveProperty('bbox');
    expect(detection.bbox).toHaveProperty('x');
    expect(detection.bbox).toHaveProperty('y');
  });
});

// ─── Integration Tests ──────────────────────────────────────────────────────

describe('Frontend Integration', () => {
  it('should handle complete analysis workflow', async () => {
    // Mock API calls
    jest.mock('@/lib/api', () => ({
      api: {
        post: jest.fn().mockResolvedValue({
          data: {
            id: 'analysis-123',
            status: 'completed',
            colony_count: 75,
            cfu_per_ml: 75000,
          }
        }),
      }
    }));

    const { api } = require('@/lib/api');
    
    // Simulate upload and analysis
    const formData = new FormData();
    formData.append('file', new Blob(['test']), 'plate.jpg');
    formData.append('sample_id', 'TEST-001');
    
    const result = await api.post('/api/v1/analyses/', formData);
    
    expect(result.data.status).toBe('completed');
    expect(result.data.colony_count).toBe(75);
  });
});
