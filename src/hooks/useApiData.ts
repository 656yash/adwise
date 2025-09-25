import { useState, useEffect, useCallback } from 'react';
import { 
  apiService, 
  DashboardSummary, 
  KPIData, 
  DetailedDataResponse, 
  FilterOptions, 
  FilterOptionsResponse,
  TrendsData 
} from '../services/api';

// Custom hook for dashboard data
export const useDashboardData = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getDashboardSummary();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Custom hook for KPI data
export const useKPIData = (filters?: FilterOptions) => {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getKPIData(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch KPI data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Custom hook for detailed data with pagination
export const useDetailedData = (
  page: number = 1,
  perPage: number = 20,
  filters?: FilterOptions
) => {
  const [data, setData] = useState<DetailedDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getDetailedData(page, perPage, filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch detailed data');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Custom hook for filter options
export const useFilterOptions = () => {
  const [data, setData] = useState<FilterOptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getFilterOptions();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch filter options');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Custom hook for trends data
export const useTrendsData = () => {
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getTrends();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trends data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Custom hook for API health check
export const useApiHealth = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await apiService.healthCheck();
      setIsHealthy(true);
    } catch (err) {
      setIsHealthy(false);
      setError(err instanceof Error ? err.message : 'API health check failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    
    // Set up periodic health checks every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, [checkHealth]);

  return { isHealthy, loading, error, checkHealth };
};

// Generic hook for any API call
export const useApiCall = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API call failed');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
