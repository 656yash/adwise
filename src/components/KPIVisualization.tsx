import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend
} from 'recharts';
import { Filter, Calendar, AlertCircle } from 'lucide-react';
import { useKPIData, useFilterOptions } from '../hooks/useApiData';
import { formatCurrency, formatNumber, formatPercentage } from '../services/api';
import { LoadingAnimation } from './ui/loading-animation';

export function KPIVisualization() {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedKPI, setSelectedKPI] = useState('impressions');
  const [initialLoad, setInitialLoad] = useState(true);
  
  // API hooks with memoized filters
  const filters = useMemo(() => ({
    platform: selectedPlatform !== 'all' ? selectedPlatform : undefined,
    campaign: selectedCampaign !== 'all' ? selectedCampaign : undefined
  }), [selectedPlatform, selectedCampaign]);
  
  const { data: kpiData, loading: kpiLoading, error: kpiError } = useKPIData(filters);
  const { data: filterOptions, loading: filterLoading } = useFilterOptions();
  
  const isInitialLoading = initialLoad && (kpiLoading || filterLoading);
  
  useEffect(() => {
    if (kpiData && filterOptions) {
      setInitialLoad(false);
    }
  }, [kpiData, filterOptions]);
  
  // Error handling
  if (kpiError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">Failed to load KPI data</p>
          <p className="text-sm text-gray-500 mt-2">{kpiError}</p>
        </div>
      </div>
    );
  }

  // Prepare filter options (must be before any early returns)
  const platformOptions = useMemo(() => {
    const platforms = filterOptions?.platforms || [];
    return [{ id: 'all', name: 'All Platforms' }, ...platforms.map(p => ({ id: p, name: p }))];
  }, [filterOptions]);

  const campaignOptions = useMemo(() => {
    const campaigns = filterOptions?.campaigns || [];
    return [{ id: 'all', name: 'All Campaigns' }, ...campaigns.map(c => ({ id: c, name: c }))];
  }, [filterOptions]);

  const kpiOptions = [
    { id: 'impressions', name: 'Impressions' },
    { id: 'clicks', name: 'Clicks' },
    { id: 'conversions', name: 'Conversions' },
    { id: 'spends', name: 'Spends' },
  ];

  // Memoized chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!kpiData?.platform_metrics) {
      return {
        kpiChartData: [],
        impressionCtrData: [],
        roasCpcData: [],
        radarData: []
      };
    }

    const kpiChartData = kpiData.platform_metrics.map(platform => ({
      platform: platform.platform,
      value: selectedKPI === 'impressions' ? platform.total_impressions :
             selectedKPI === 'clicks' ? platform.total_clicks :
             selectedKPI === 'conversions' ? platform.total_conversions :
             selectedKPI === 'spends' ? platform.total_spent : 0
    }));

    const impressionCtrData = kpiData.platform_metrics.map(platform => ({
      platform: platform.platform,
      impressions: platform.total_impressions,
      ctr: platform.avg_ctr
    }));

    // Use kpi_data if available, otherwise create from platform_metrics
    const roasCpcData = kpiData.kpi_data?.length > 0 
      ? kpiData.kpi_data.slice(0, 10).map((campaign, index) => ({
          date: campaign.date || `Day ${index + 1}`,
          platform: campaign.platform,
          roas: campaign.roas || 0,
          cpc: campaign.cpc || 0
        }))
      : kpiData.platform_metrics?.map((platform, index) => ({
          date: `Platform ${index + 1}`,
          platform: platform.platform,
          roas: platform.avg_roas || 0,
          cpc: platform.avg_cpc || 0
        })) || [];

    const maxClicks = Math.max(...(kpiData.platform_metrics?.map(p => p.total_clicks) || [1]));
    const maxConversions = Math.max(...(kpiData.platform_metrics?.map(p => p.total_conversions) || [1]));
    
    const radarData = kpiData.platform_metrics.map(platform => ({
      platform: platform.platform,
      clicks: platform.total_clicks,
      conversions: platform.total_conversions,
      clicksNormalized: (platform.total_clicks / maxClicks) * 100,
      conversionsNormalized: (platform.total_conversions / maxConversions) * 100
    }));

    return { kpiChartData, impressionCtrData, roasCpcData, radarData };
  }, [kpiData, selectedKPI]);

  const { kpiChartData, impressionCtrData, roasCpcData, radarData } = chartData;

  // Debug logging
  console.log('KPI Visualization - kpiData:', kpiData);
  console.log('KPI Visualization - platform_metrics:', kpiData?.platform_metrics);
  console.log('KPI Visualization - kpi_data:', kpiData?.kpi_data);
  console.log('KPI Visualization - chartData:', chartData);
  console.log('KPI Visualization - filterOptions:', filterOptions);
  console.log('KPI Visualization - isInitialLoading:', isInitialLoading);

  // Show loading only on initial load (after all hooks)
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="neon-text-pink neon-pulse-pink">KPI Visualization</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-[var(--neon-pink)] neon-glow-pink" />
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-48 cyberpunk-select-trigger-pink">
                <SelectValue placeholder="Select Platform" />
              </SelectTrigger>
              <SelectContent className="cyberpunk-select-content-pink">
                {platformOptions.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id} className="cyberpunk-select-item">
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-[var(--electric-blue)] neon-glow-blue" />
            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
              <SelectTrigger className="w-48 cyberpunk-select-trigger">
                <SelectValue placeholder="Select Campaign" />
              </SelectTrigger>
              <SelectContent className="cyberpunk-select-content">
                {campaignOptions.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id} className="cyberpunk-select-item">
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform vs KPI - Line Chart with KPI Filter */}
        <Card className="neon-border-blue hover:shadow-2xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[var(--electric-blue)] neon-text-blue">Platform vs KPI</CardTitle>
            <Select value={selectedKPI} onValueChange={setSelectedKPI}>
              <SelectTrigger className="w-32 cyberpunk-select-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="cyberpunk-select-content">
                {kpiOptions.map((kpi) => (
                  <SelectItem key={kpi.id} value={kpi.id} className="cyberpunk-select-item">
                    {kpi.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={kpiChartData}>
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
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--electric-blue)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--electric-blue)', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: 'var(--electric-blue)', strokeWidth: 3, fill: 'var(--neon-pink)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform vs Impression/CTR - Stack Column */}
        <Card className="neon-border-pink hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[var(--neon-pink)] neon-text-pink">Platform vs Impression/CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={impressionCtrData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 0, 128, 0.3)" />
                <XAxis 
                  dataKey="platform"
                  tick={{ fontSize: 12, fill: '#888888' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis yAxisId="impressions" orientation="left" tick={{ fill: '#888888' }} />
                <YAxis yAxisId="ctr" orientation="right" tick={{ fill: '#888888' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid var(--neon-pink)',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Bar yAxisId="impressions" dataKey="impressions" fill="var(--electric-blue)" />
                <Bar yAxisId="ctr" dataKey="ctr" fill="var(--neon-pink)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform vs ROAS/CPC with Date - Stack Area */}
        <Card className="neon-border-blue hover:shadow-2xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[var(--electric-blue)] neon-text-blue">Platform vs ROAS/CPC (Timeline)</CardTitle>
            <Calendar className="h-4 w-4 text-[var(--electric-blue)] neon-glow-blue" />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={roasCpcData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 128, 255, 0.3)" />
                <XAxis dataKey="date" tick={{ fill: '#888888' }} />
                <YAxis tick={{ fill: '#888888' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid var(--electric-blue)',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="roas" 
                  stackId="1" 
                  stroke="var(--electric-blue)" 
                  fill="var(--electric-blue)"
                  fillOpacity={0.4}
                />
                <Area 
                  type="monotone" 
                  dataKey="cpc" 
                  stackId="1" 
                  stroke="var(--neon-pink)" 
                  fill="var(--neon-pink)"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Performance Radar - Click vs Conversion */}
        <Card className="neon-border-pink hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[var(--neon-pink)] neon-text-pink">Platform Performance Radar</CardTitle>
            <p className="text-sm text-muted-foreground">
              Comparing clicks and conversions across platforms
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke="rgba(255, 0, 128, 0.3)" />
                <PolarAngleAxis 
                  dataKey="platform" 
                  tick={{ fontSize: 11, fill: '#888888' }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10, fill: '#888888' }}
                />
                <Radar
                  name="Clicks (Normalized)"
                  dataKey="clicksNormalized"
                  stroke="var(--electric-blue)"
                  fill="var(--electric-blue)"
                  fillOpacity={0.3}
                  strokeWidth={3}
                />
                <Radar
                  name="Conversions (Normalized)"
                  dataKey="conversionsNormalized"
                  stroke="var(--neon-pink)"
                  fill="var(--neon-pink)"
                  fillOpacity={0.3}
                  strokeWidth={3}
                />
                <Legend 
                  wrapperStyle={{ color: '#ffffff' }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const platform = radarData.find(d => d.platform === label);
                      return (
                        <div className="bg-card border border-[var(--neon-pink)] rounded-lg p-3 shadow-lg">
                          <p className="font-medium text-[var(--neon-pink)]">{label}</p>
                          <p className="text-[var(--electric-blue)]">Clicks: {platform?.clicks}</p>
                          <p className="text-[var(--neon-pink)]">Conversions: {platform?.conversions}</p>
                          <p className="text-sm text-muted-foreground">
                            Conversion Rate: {platform?.clicks && platform?.conversions ? 
                              ((platform.conversions / platform.clicks) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}