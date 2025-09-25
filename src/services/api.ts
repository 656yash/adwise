// API service for KPI Dashboard
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Types for API responses
export interface DashboardSummary {
  summary: {
    total_campaigns: number;
    total_impressions: number;
    total_clicks: number;
    total_conversions: number;
    total_spent: number;
    avg_roi: number;
    avg_roas: number;
    avg_cpc: number;
    avg_ctr: number;
  };
  platforms: PlatformMetric[];
  recent_campaigns: CampaignData[];
}

export interface PlatformMetric {
  platform: string;
  campaigns?: number;
  // New API format
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_spent: number;
  avg_roi: number;
  avg_roas: number;
  avg_cpc: number;
  avg_ctr: number;
  // Legacy format for backward compatibility
  impressions?: number;
  clicks?: number;
  conversions?: number;
  spent?: number;
}

export interface CampaignData {
  id?: number;
  platform: string;
  campaign: string;
  impressions: number;
  clicks: number;
  conversion: number;
  spent: number;
  roi: number;
  roas: number;
  cpc: number;
  ctr: number;
  kpi: number;
  date: string;
}

export interface KPIData {
  kpi_data: CampaignData[];
  platform_metrics: PlatformMetric[];
  campaign_metrics: CampaignMetric[];
  filters_applied: FilterOptions;
}

export interface CampaignMetric {
  campaign: string;
  platform: string;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_spent: number;
  avg_roi: number;
  avg_roas: number;
}

export interface DetailedDataResponse {
  data: CampaignData[];
  pagination: {
    page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters_applied: FilterOptions;
}

export interface FilterOptions {
  platform?: string;
  campaign?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface FilterOptionsResponse {
  platforms: string[];
  campaigns: string[];
  date_range: {
    min_date: string;
    max_date: string;
  };
}

export interface TrendsData {
  daily_trends: DailyTrend[];
  platform_trends: PlatformTrend[];
}

export interface DailyTrend {
  date: string;
  daily_impressions: number;
  daily_clicks: number;
  daily_conversions: number;
  daily_spent: number;
  daily_roi: number;
  daily_roas: number;
}

export interface PlatformTrend {
  platform: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spent: number;
  roi: number;
}

// API service class
class ApiService {
  private async fetchWithErrorHandling<T>(url: string): Promise<T> {
    try {
      console.log('API Request:', url);
      const response = await fetch(url);
      console.log('API Response Status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('API Response Data:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/health`);
  }

  // Dashboard endpoints
  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/dashboard/summary`);
  }

  // KPI endpoints
  async getKPIData(filters?: FilterOptions): Promise<KPIData> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const url = `${API_BASE_URL}/kpi/data${params.toString() ? `?${params.toString()}` : ''}`;
    return this.fetchWithErrorHandling(url);
  }

  // Detailed data endpoints
  async getDetailedData(
    page: number = 1,
    perPage: number = 20,
    filters?: FilterOptions
  ): Promise<DetailedDataResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    
    const url = `${API_BASE_URL}/data/detailed?${params.toString()}`;
    return this.fetchWithErrorHandling(url);
  }

  // Filter options
  async getFilterOptions(): Promise<FilterOptionsResponse> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/filters/options`);
  }

  // Trends data
  async getTrends(): Promise<TrendsData> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/analytics/trends`);
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Utility functions for data formatting
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
