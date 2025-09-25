import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';
import { TrendingUp, Play, CheckCircle, Filter, AlertCircle } from 'lucide-react';
import { LoadingAnimation } from './ui/loading-animation';
import { useDashboardData, useFilterOptions } from '../hooks/useApiData';
import { formatCurrency, formatNumber, formatPercentage } from '../services/api';

export function Dashboard() {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useDashboardData();
  const { data: filterOptions, loading: filterLoading } = useFilterOptions();

  // Test API connection
  useEffect(() => {
    const testAPI = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        console.log('API Health Check:', data);
      } catch (error) {
        console.error('API Connection Error:', error);
      }
    };
    testAPI();
  }, []);

  // Error handling
  if (dashboardError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  // Memoized filter options
  const platformOptions = useMemo(() => {
    const platforms = filterOptions?.platforms || [];
    return [{ id: 'all', name: 'All platforms' }, ...platforms.map(p => ({ id: p, name: p }))];
  }, [filterOptions]);

  // Memoized chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!dashboardData) return { roasData: [], ctrData: [], performanceData: [], roiTrendData: [] };

    const roasData = dashboardData.platforms?.map(platform => ({
      platform: platform.platform,
      roas: platform.avg_roi,
      campaigns: platform.campaigns,
      spent: platform.total_spent || platform.spent || 0
    })) || [];

    const ctrData = dashboardData.platforms?.map((platform, index) => ({
      platform: platform.platform,
      ctr: ((platform.total_clicks || platform.clicks || 0) / (platform.total_impressions || platform.impressions || 1) * 100),
      color: index % 2 === 0 ? '#0080ff' : '#ff0080',
      clicks: platform.total_clicks || platform.clicks || 0,
      impressions: platform.total_impressions || platform.impressions || 0
    })) || [];

    const performanceData = dashboardData.recent_campaigns?.slice(0, 6).map(campaign => ({
      campaign: campaign.campaign.substring(0, 8) + '...',
      impressions: campaign.impressions,
      clicks: campaign.clicks,
      conversions: campaign.conversion,
      platform: campaign.platform
    })) || [];

    const roiTrendData = dashboardData.recent_campaigns?.slice(0, 6).map(campaign => ({
      campaign: campaign.campaign.substring(0, 8) + '...',
      roi: campaign.roi,
      roas: campaign.roas,
      date: campaign.date
    })) || [];

    return { roasData, ctrData, performanceData, roiTrendData };
  }, [dashboardData]);

  const { roasData, ctrData, performanceData, roiTrendData } = chartData;

  // Debug logging
  console.log('Dashboard - dashboardData:', dashboardData);
  console.log('Dashboard - filterOptions:', filterOptions);
  console.log('Dashboard - dashboardLoading:', dashboardLoading);
  console.log('Dashboard - filterLoading:', filterLoading);

  // Show loading while fetching data
  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingAnimation />
      </div>
    );
  }

  // If no data after loading, show a message
  if (!dashboardData && !dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-500">No dashboard data available</p>
          <p className="text-sm text-gray-500 mt-2">Please check API connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="neon-text-blue neon-pulse-blue">Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="neon-border-blue hover:neon-border-pink transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium neon-text-blue">Total Campaigns</CardTitle>
              <TrendingUp className="h-4 w-4 text-[var(--electric-blue)] neon-glow-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--electric-blue)]">
                {dashboardData?.summary?.total_campaigns || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total Spent: {formatCurrency(dashboardData?.summary?.total_spent || 0)}
              </p>
            </CardContent>
          </Card>

          <Card className="neon-border-pink hover:neon-border-blue transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--neon-pink)]">Total Impressions</CardTitle>
              <Play className="h-4 w-4 text-[var(--neon-pink)] neon-glow-pink" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--neon-pink)]">
                {formatNumber(dashboardData?.summary?.total_impressions || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg CTR: {formatPercentage(dashboardData?.summary?.avg_ctr || 0)}
              </p>
            </CardContent>
          </Card>

          <Card className="neon-border-blue hover:neon-border-pink transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--electric-blue)]">Total Conversions</CardTitle>
              <CheckCircle className="h-4 w-4 text-[var(--electric-blue)] neon-glow-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--neon-pink)]">
                {formatNumber(dashboardData?.summary?.total_conversions || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg ROI: {dashboardData?.summary?.avg_roi?.toFixed(2) || '0.00'}x
              </p>
            </CardContent>
          </Card>
        </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform vs ROAS - Bar Chart */}
        <Card className="neon-border-blue hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[var(--electric-blue)] neon-text-blue">Platform vs ROAS</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roasData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 128, 255, 0.3)" />
                <XAxis 
                  dataKey="platform" 
                  tick={{ fontSize: 12, fill: '#888888' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#888888' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid var(--electric-blue)',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value, name) => [
                    name === 'roas' ? `${(typeof value === 'number' ? value : 0).toFixed(2)}x` : formatCurrency(typeof value === 'number' ? value : 0),
                    name === 'roas' ? 'ROI' : 'Total Spent'
                  ]}
                />
                <Bar dataKey="roas" fill="var(--electric-blue)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform vs CTR - Pie Chart */}
        <Card className="neon-border-pink hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[var(--neon-pink)] neon-text-pink">Platform vs CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ctrData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ platform, ctr }) => `${platform}: ${ctr.toFixed(2)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="ctr"
                >
                  {ctrData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid var(--neon-pink)',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value) => [`${(typeof value === 'number' ? value : 0).toFixed(2)}%`, 'CTR']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign Performance - Area Chart */}
        <Card className="neon-border-blue hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[var(--electric-blue)] neon-text-blue">Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 128, 255, 0.3)" />
                <XAxis 
                  dataKey="campaign"
                  tick={{ fontSize: 12, fill: '#888888' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#888888' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid var(--electric-blue)',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value, name) => [formatNumber(typeof value === 'number' ? value : 0), typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : String(name)]}
                />
                <Area type="monotone" dataKey="impressions" stackId="1" stroke="var(--electric-blue)" fill="var(--electric-blue)" fillOpacity={0.6} />
                <Area type="monotone" dataKey="clicks" stackId="1" stroke="var(--neon-pink)" fill="var(--neon-pink)" fillOpacity={0.6} />
                <Area type="monotone" dataKey="conversions" stackId="1" stroke="var(--neon-green)" fill="var(--neon-green)" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ROI Trends - Line Chart */}
        <Card className="neon-border-pink hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[var(--neon-pink)] neon-text-pink">ROI Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={roiTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 0, 128, 0.3)" />
                <XAxis 
                  dataKey="campaign"
                  tick={{ fontSize: 12, fill: '#888888' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#888888' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid var(--neon-pink)',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value, name) => [`${(typeof value === 'number' ? value : 0).toFixed(2)}x`, typeof name === 'string' ? name.toUpperCase() : String(name)]}
                />
                <Line type="monotone" dataKey="roi" stroke="var(--electric-blue)" strokeWidth={3} dot={{ fill: 'var(--electric-blue)', strokeWidth: 2, r: 6 }} />
                <Line type="monotone" dataKey="roas" stroke="var(--neon-pink)" strokeWidth={3} dot={{ fill: 'var(--neon-pink)', strokeWidth: 2, r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}