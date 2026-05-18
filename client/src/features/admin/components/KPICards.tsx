import React, { memo } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  onClick?: () => void;
  clickable?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'blue',
  onClick,
  clickable = false
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          accent: 'text-green-600'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          accent: 'text-yellow-600'
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          accent: 'text-red-600'
        };
      case 'gray':
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          accent: 'text-gray-600'
        };
      default:
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          accent: 'text-blue-600'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div 
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 ${
        clickable ? 'cursor-pointer hover:border-blue-300 hover:shadow-blue-100' : ''
      }`}
      onClick={clickable ? onClick : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}{changeLabel || '%'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colors.bg}`}>
            <div className={colors.text}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface KPICardsProps {
  data: {
    summary: {
      totalRequests: number;
      pendingRequests: number;
      approvedThisMonth: number;
      rejectedThisMonth: number;
      changes: {
        totalRequestsChange: number;
        pendingRequestsChange: number;
        approvedThisMonthChange: number;
        rejectedThisMonthChange: number;
      };
    };
  } | null;
  loading: boolean;
  onCardClick?: (category: 'total' | 'pending' | 'approved' | 'rejected') => void;
}

const KPICards: React.FC<KPICardsProps> = memo(({ data, loading, onCardClick }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 md:w-24 mb-2"></div>
                <div className="h-6 md:h-8 bg-gray-200 rounded w-12 md:w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16 md:w-20"></div>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      <KPICard
        title="Total Requests"
        value={data.summary.totalRequests}
        change={data.summary.changes.totalRequestsChange}
        onClick={() => onCardClick?.('total')}
        clickable={!!onCardClick}
        icon={
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        color="blue"
      />

      <KPICard
        title="Pending Approvals"
        value={data.summary.pendingRequests}
        change={data.summary.changes.pendingRequestsChange}
        onClick={() => onCardClick?.('pending')}
        clickable={!!onCardClick}
        icon={
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        color="yellow"
      />

      <KPICard
        title="Approved This Month"
        value={data.summary.approvedThisMonth}
        change={data.summary.changes.approvedThisMonthChange}
        onClick={() => onCardClick?.('approved')}
        clickable={!!onCardClick}
        icon={
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        color="green"
      />

      <KPICard
        title="Rejected This Month"
        value={data.summary.rejectedThisMonth}
        change={data.summary.changes.rejectedThisMonthChange}
        onClick={() => onCardClick?.('rejected')}
        clickable={!!onCardClick}
        icon={
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        }
        color="red"
      />
    </div>
  );
});

KPICards.displayName = 'KPICards';

export default KPICards;
