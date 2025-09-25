import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  MoreHorizontal,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useDetailedData, useFilterOptions } from '../hooks/useApiData';
import { formatCurrency, formatNumber, formatPercentage } from '../services/api';
import { LoadingAnimation } from './ui/loading-animation';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface CampaignData {
  id: string;
  campaignName: string;
  platform: string;
  status: 'Active' | 'Paused' | 'Completed' | 'Draft';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
  startDate: string;
  endDate: string;
}

export function DataDetails() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Memoized API filters
  const filters = useMemo(() => ({
    platform: selectedPlatform !== 'all' ? selectedPlatform : undefined,
    campaign: selectedCampaign !== 'all' ? selectedCampaign : undefined,
    sort_by: sortBy,
    sort_order: sortOrder.toUpperCase()
  }), [selectedPlatform, selectedCampaign, sortBy, sortOrder]);
  
  const { data: detailedData, loading: dataLoading, error: dataError, refetch } = useDetailedData(currentPage, perPage, filters);
  const { data: filterOptions, loading: filterLoading } = useFilterOptions();
  
  const isInitialLoading = initialLoad && (dataLoading || filterLoading);
  
  useEffect(() => {
    if (detailedData && filterOptions) {
      setInitialLoad(false);
    }
  }, [detailedData, filterOptions]);
  
  // Error handling
  if (dataError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">Failed to load data</p>
          <p className="text-sm text-gray-500 mt-2">{dataError}</p>
          <Button onClick={refetch} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  // Prepare filter options
  const platforms = filterOptions?.platforms || [];
  const campaigns = filterOptions?.campaigns || [];
  const platformOptions = [{ id: 'all', name: 'All Platforms' }, ...platforms.map(p => ({ id: p, name: p }))];
  const campaignOptions = [{ id: 'all', name: 'All Campaigns' }, ...campaigns.map(c => ({ id: c, name: c }))];

  // Function to format date from DD-MM-YYYY to proper format
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    // Handle DD-MM-YYYY format from CSV
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      // Convert to MM/DD/YYYY format that JavaScript can parse
      const formattedDate = `${month}/${day}/${year}`;
      const date = new Date(formattedDate);
      
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    }
    
    return dateString; // Return original if parsing fails
  };

  // Get data from API
  const campaignData = detailedData?.data?.map(item => ({
    id: item.id?.toString() || Math.random().toString(),
    campaignName: item.campaign,
    platform: item.platform,
    status: 'Active' as const, // Default status since CSV doesn't have this
    budget: item.spent * 1.5, // Estimate budget as 1.5x spent
    spent: item.spent,
    impressions: item.impressions,
    clicks: item.clicks,
    conversions: item.conversion,
    ctr: item.ctr,
    cpc: item.cpc,
    roas: item.roas,
    startDate: formatDate(item.date),
    endDate: formatDate(item.date)
  })) || [];

  // Memoized filtered data for better performance
  const filteredData = useMemo(() => {
    return campaignData.filter(campaign => {
      const matchesSearch = campaign.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.platform.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = selectedPlatform === 'all' || campaign.platform === selectedPlatform;
      const matchesCampaign = selectedCampaign === 'all' || campaign.campaignName === selectedCampaign;
      
      return matchesSearch && matchesPlatform && matchesCampaign;
    });
  }, [campaignData, searchTerm, selectedPlatform, selectedCampaign]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + perPage);

  // CSV Export function
  const exportToCSV = () => {
    const headers = [
      'Campaign Name',
      'Platform',
      'Status',
      'Budget',
      'Spent',
      'Impressions',
      'Clicks',
      'Conversions',
      'CTR (%)',
      'CPC ($)',
      'ROAS',
      'Start Date',
      'End Date'
    ];

    const csvData = filteredData.map(campaign => [
      campaign.campaignName,
      campaign.platform,
      campaign.status,
      campaign.budget,
      campaign.spent,
      campaign.impressions,
      campaign.clicks,
      campaign.conversions,
      campaign.ctr.toFixed(2),
      campaign.cpc.toFixed(2),
      campaign.roas.toFixed(2),
      campaign.startDate,
      campaign.endDate
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `campaign_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      'Paused': { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      'Completed': { variant: 'outline' as const, color: 'bg-blue-100 text-blue-800' },
      'Draft': { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getTrendIcon = (value: number, threshold: number) => {
    return value >= threshold ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  // Show loading only on initial load
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
        <h1>Data Details</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refetch} disabled={dataLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV} disabled={dataLoading || filteredData.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns or platforms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {campaignOptions.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance Data</CardTitle>
          <p className="text-sm text-muted-foreground">
            Showing {paginatedData.length} of {filteredData.length} campaigns
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>CTR %</TableHead>
                  <TableHead>CPC</TableHead>
                  <TableHead>ROAS</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    </TableRow>
                  ))
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8">
                      No campaigns found
                    </TableCell>
                  </TableRow>
                ) : paginatedData.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      {campaign.campaignName}
                    </TableCell>
                    <TableCell>{campaign.platform}</TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell>{formatCurrency(campaign.budget)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{formatCurrency(campaign.spent)}</span>
                        {campaign.spent > 0 && (
                          <div className="text-xs text-muted-foreground">
                            ({((campaign.spent / campaign.budget) * 100).toFixed(0)}%)
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatNumber(campaign.impressions)}</TableCell>
                    <TableCell>{formatNumber(campaign.clicks)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{formatNumber(campaign.conversions)}</span>
                        {campaign.conversions > 0 && getTrendIcon(campaign.conversions, 100)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{campaign.ctr.toFixed(1)}%</span>
                        {campaign.ctr > 0 && getTrendIcon(campaign.ctr, 3)}
                      </div>
                    </TableCell>
                    <TableCell>{campaign.cpc > 0 ? `₹${campaign.cpc.toFixed(2)}` : '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{campaign.roas > 0 ? `${campaign.roas.toFixed(1)}x` : '-'}</span>
                        {campaign.roas > 0 && getTrendIcon(campaign.roas, 3)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(campaign.startDate).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {new Date(campaign.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Campaign</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete Campaign
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}