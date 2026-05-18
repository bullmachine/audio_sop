import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { useLoader } from '../../shared/hooks/useLoader';
import { apiRequest } from '../../services/axios';
import KPICards from './components/KPICards';
import RecentRequestsTable from './components/RecentRequestsTable';
import DateRangeSelector from './components/DateRangeSelector';
import { Select } from '../../shared/component/Select';


// Type definition for dashboard data
interface DashboardData {
  summary: {
    totalRequests: number;
    pendingRequests: number;
    approvedThisMonth: number;
    rejectedThisMonth: number;
    averageApprovalTime: number;
    totalApprovedValue: number;
    changes: {
      totalRequestsChange: number;
      pendingRequestsChange: number;
      approvedThisMonthChange: number;
      rejectedThisMonthChange: number;
    };
  };
  trends: Array<{
    date: string;
    created: number;
    approved: number;
    rejected: number;
    pending: number;
  }>;
  analytics: Array<{
    group: string;
    count: number;
    totalValue: number;
    approvedValue: number;
  }>;
  levelAnalytics: Array<{
    level: string;
    count: number;
    totalValue: number;
  }>;
  recentActivity: any[]; // Use any[] to match the complete backend response
}

interface ApiResponse {
  success: boolean;
  data: DashboardData;
  timestamp: string;
}

// Lazy load Charts component to improve initial load performance
const Charts = lazy(() => import('./components/Charts'));

const Dashboard: React.FC = () => {
  const { simulateAsync, isLoading } = useLoader();
  const [data, setData] = useState<DashboardData | null>(null);
  const [plants, setPlants] = useState<Array<{ plant: string }>>([]);
  const [selectedPlant, setSelectedPlant] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'total' | 'pending' | 'approved' | 'rejected' | null>(null);
  const recentRequestsTableRef = useRef<HTMLDivElement>(null);
  
  // Initialize with current month as default - match DateRangeSelector calculation
  const getDefaultDateRange = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    return {
      startDate,
      endDate
    };
  };
  
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(getDefaultDateRange());

  const fetchPlants = async () => {
    try {
      const response = await apiRequest.get('/dashboard/plants') as any;
      if (response.success && response.data) {
        setPlants(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch plants:', err);
    }
  };

  const fetchDashboardData = async (startDate?: string, endDate?: string, plant?: string) => {
    try {
      const params: any = {};
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      if (plant) {
        params.plant = plant;
      }

      const response: ApiResponse = await apiRequest.get<ApiResponse>('/dashboard/', { params }); 
      
      if (response.success && response.data) {
        // Ensure data has all required properties with fallbacks
        const safeData = {
          summary: {
            totalRequests: response.data.summary?.totalRequests || 0,
            pendingRequests: response.data.summary?.pendingRequests || 0,
            approvedThisMonth: response.data.summary?.approvedThisMonth || 0,
            rejectedThisMonth: response.data.summary?.rejectedThisMonth || 0,
            averageApprovalTime: response.data.summary?.averageApprovalTime || 0,
            totalApprovedValue: response.data.summary?.totalApprovedValue || 0,
            changes: response.data.summary?.changes || {
              totalRequestsChange: 0,
              pendingRequestsChange: 0,
              approvedThisMonthChange: 0,
              rejectedThisMonthChange: 0
            }
          },
          trends: Array.isArray(response.data.trends) ? response.data.trends : [],
          analytics: Array.isArray(response.data.analytics) ? response.data.analytics : [],
          levelAnalytics: Array.isArray(response.data.levelAnalytics) ? response.data.levelAnalytics : [],
          recentActivity: Array.isArray(response.data.recentActivity) ? response.data.recentActivity : []
        };

        setData(safeData);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      // Error handling is done by useLoader hook
    }
  };

  const fetchDashboardDataWithLoader = async (startDate?: string, endDate?: string, plant?: string) => {
    await simulateAsync(
      async () => {
        await fetchDashboardData(startDate, endDate, plant);
      },
      "Loading Dashboard...",
      1000
    );
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => { 
    setDateRange({ startDate, endDate }); 
    fetchDashboardDataWithLoader(startDate, endDate, selectedPlant);
  };

  const handlePlantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const plant = e.target.value;
    setSelectedPlant(plant);
    fetchDashboardDataWithLoader(dateRange?.startDate, dateRange?.endDate, plant);
  };

  const handleCardClick = (category: 'total' | 'pending' | 'approved' | 'rejected') => {
    setFilterCategory(category);
    // Scroll to RecentRequestsTable after a short delay to allow re-render
    setTimeout(() => {
      recentRequestsTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  useEffect(() => {
    fetchPlants();
    fetchDashboardDataWithLoader();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen ">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 py-6 md:py-8 w-full">
        <div className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight truncate">
                Cost Rate Approval Dashboard
              </h1>
              <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600 line-clamp-2">
                Monitor and manage cost rate approval workflows across all plants
              </p>
              <div className="mt-2 h-1 w-16 md:w-20 bg-blue-600 rounded-full"></div>
            </div> */}
            <div className="flex items-center space-x-3 md:space-x-4 flex-shrink-0">
              {/* Plant Selector */}
              <Select
                value={selectedPlant}
                onChange={handlePlantChange}
                label=" "
                options={[
                  { label: "All Plants", value: "" },
                  ...plants.map(p => ({ label: p.plant, value: p.plant }))
                ]}
                searchPlaceholder="Select plant"
                className="w-40 md:w-56 lg:w-64 text-xs"
              />
              <DateRangeSelector
                onDateRangeChange={handleDateRangeChange}
                isLoading={isLoading}
                selectedStartDate={dateRange?.startDate}
                selectedEndDate={dateRange?.endDate}
                className="text-xs"
              />
              <button
                onClick={() => fetchDashboardDataWithLoader(dateRange?.startDate, dateRange?.endDate)}
                disabled={isLoading}
                className="inline-flex items-center px-3 md:px-4 py-2 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm flex-shrink-0"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isLoading && !data ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6 md:py-8 space-y-6 md:space-y-8" >
        {/* KPI Cards */}
        <KPICards data={data} loading={isLoading} onCardClick={handleCardClick} />

        {/* Charts Section - Lazy loaded */}
        <Suspense fallback={
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
                <div className="h-4 md:h-5 xl:h-6 bg-gray-200 rounded w-24 md:w-32 xl:w-48 mb-2 md:mb-3 xl:mb-4"></div>
                <div className="h-32 md:h-48 xl:h-64 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        }>
          <Charts data={data} loading={isLoading} />
        </Suspense>

        {/* Recent Requests Table */}
        <div ref={recentRequestsTableRef}>
          <RecentRequestsTable data={{ recentActivity: data?.recentActivity || [] }} loading={isLoading} filterCategory={filterCategory} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
