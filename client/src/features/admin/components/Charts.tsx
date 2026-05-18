import React, { useMemo, memo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Define interfaces for chart data
interface TrendItem {
  date: string;
  created: number;
  approved: number;
  rejected: number;
  pending: number;
}

interface RecentActivityItem {
  _id: string;
  reference_number: string;
  resource_group?: {
    location?: string;
  };
}

interface AnalyticsItem {
  group: string;
  count: number;
  totalValue: number;
  approvedValue: number;
}

interface LevelAnalyticsItem {
  level: string;
  count: number;
  totalValue: number;
}

interface DashboardData {
  summary?: {
    averageApprovalTime?: number;
    totalApprovedValue?: number;
  };
  trends: TrendItem[];
  analytics: AnalyticsItem[];
  levelAnalytics: LevelAnalyticsItem[];
  recentActivity: RecentActivityItem[];
}

// Register Chart.js components once
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  );
};

interface ChartsProps {
  data: DashboardData | null;
  loading: boolean;
}

const Charts: React.FC<ChartsProps> = memo(({ data, loading }) => {
  const lineChartData = useMemo(() => {
    if (!data?.trends || data.trends.length === 0) return null;

    // Simplify data processing - take last 7 days only for better performance
    const recentTrends = data.trends.slice(-7);

    return {
      labels: recentTrends.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Total',
          data: recentTrends.map(item => item.created),
          borderColor: '#3B82F6',
          backgroundColor: '#3B82F6',
          tension: 0.1,
          fill: false,
        },
      ],
    };
  }, [data?.trends]);

  const levelChartData = useMemo(() => {
    if (!data?.levelAnalytics || data.levelAnalytics.length === 0) return null;

    // Prepare level data for chart
    const levelData = data.levelAnalytics.slice(0, 8); // Limit to top 8 levels

    return {
      labels: levelData.map(item => item.level || 'Unknown Level'),
      datasets: [
        {
          label: 'Requests',
          data: levelData.map(item => item.count),
          backgroundColor: [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#06B6D4', '#84CC16', '#F97316', '#EC4899'
          ],
        },
      ],
    };
  }, [data?.levelAnalytics]);

  // const doughnutChartData = useMemo(() => {
  //   if (!data?.analytics || data.analytics.length === 0) return null;

  //   // Simplify status data processing
  //   const statusData: { [key: string]: number } = {};
  //   data.analytics.forEach(item => {
  //     statusData[item.group] = item.count;
  //   });

  //   return {
  //     labels: Object.keys(statusData),
  //     datasets: [
  //       {
  //         data: Object.values(statusData),
  //         backgroundColor: ['#3B82F6', '#10B981', '#EF4444'],
  //         borderWidth: 0,
  //       },
  //     ],
  //   };
  // }, [data?.analytics]);

  // Simplified chart options for better performance
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend to reduce DOM complexity
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
    elements: {
      point: {
        radius: 2, // Smaller points for better performance
      },
    },
  };

  // const doughnutOptions = {
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   plugins: {
  //     legend: {
  //       position: 'bottom' as const,
  //       labels: {
  //         boxWidth: 12,
  //         padding: 8,
  //       },
  //     },
  //   },
  //   cutout: '60%', // Add cutout for better visual
  // };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <ChartCard title="Monthly Trends" loading={loading}>
        {lineChartData && (
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        )}
      </ChartCard>

      <ChartCard title="Requests by Level" loading={loading}>
        {levelChartData && (
          <div className="h-64">
            <Bar data={levelChartData} options={chartOptions} />
          </div>
        )}
      </ChartCard>

      {/* <ChartCard title="Approval Status" loading={loading}>
        {doughnutChartData && (
          <div className="h-64 flex items-center justify-center">
            <div className="w-48 h-48">
              <Doughnut data={doughnutChartData} options={doughnutOptions} />
            </div>
          </div>
        )}
      </ChartCard>

      <ChartCard title="Performance Metrics" loading={loading}>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {data?.summary?.averageApprovalTime || 0}h
            </div>
            <div className="text-sm text-gray-600">Avg Approval Time</div>
            <div className="mt-4 text-lg font-semibold text-gray-900">
              {data?.summary?.totalApprovedValue ? `$${(data.summary.totalApprovedValue / 1000000).toFixed(1)}M` : '$0'}
            </div>
            <div className="text-sm text-gray-600">Total Approved Value</div>
          </div>
        </div>
      </ChartCard> */}
    </div>
  );
});

Charts.displayName = 'Charts';

export default Charts;
