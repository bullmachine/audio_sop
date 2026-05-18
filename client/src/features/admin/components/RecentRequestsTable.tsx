import React, { memo } from 'react';
import DataTable from '../../../shared/component/table/DataTable';
import NoData from '../../../shared/component/NoData';

// Define the request interface for recent activity - matches complete Request API response
interface RecentRequest {
  _id: string;
  reference_number?: string;
  status: 'pending' | 'approved' | 'rejected';
  request_group?: {
    _id: string;
    reference_number: string;
    user_id: string;
    status: string;
    isActive: boolean;
    isDeleted: boolean;
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  resource_group?: {
    _id: string;
    code: string;
    description: string;
    type: string;
    location: string | string[];
    isActive: boolean;
    isDeleted: boolean;
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  cost_type?: string;
  part?: {
    _id: string;
    code: string;
    description: string;
    isActive: boolean;
    isDeleted: boolean;
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  process?: {
    _id: string;
    process: string;
    process_description?: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  user_id?: {
    _id: string;
    name: string;
    empCode?: string;
    email: string;
    mobile?: string;
    role?: string;
    isDeleted: boolean;
    deletedAt?: string;
    __v: number;
    createdAt: string;
    updatedAt: string;
  };
  start_date?: string;
  end_date?: string;
  skilled_min?: number;
  unskilled_min?: number;
  skilled_rate?: number;
  unskilled_rate?: number;
  standard_cost?: number;
  proposed_cost?: number;
  process_skilled_rate?: number;
  process_unskilled_rate?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  approved_level?: {
    _id: string;
    name: string;
    value: number;
    isActive: boolean;
    isDeleted: boolean;
    __v: number;
    createdAt: string;
    updatedAt: string;
  };
  approved_by?: {
    _id: string;
    name: string;
    empCode?: string;
    email: string;
    mobile?: string;
    role?: string;
    isDeleted: boolean;
    __v: number;
    createdAt: string;
    updatedAt: string;
  };
  completed_date?: string;
  costHistory?: Array<{
    _id: string;
    resource_group: string;
    cost_type: string;
    from_date: string;
    to_date?: string;
    part: string;
    part_description: string;
    operation: string;
    Active: boolean;
    unit_cost: number;
    unit?: any;
    isDeleted: boolean;
    deletedAt?: string;
    __v: number;
    createdAt: string;
    updatedAt: string;
  }>;
  current_level?: {
    _id: string;
    name: string;
    value: number;
    isActive: boolean;
    isDeleted: boolean;
    __v: number;
    createdAt: string;
    updatedAt: string;
  };
  current_level_user?: Array<{
    _id: string;
    name: string;
    empCode?: string;
    email: string;
    mobile?: string;
    role?: string;
    isDeleted: boolean;
    __v: number;
    createdAt: string;
    updatedAt: string;
  }>;
  document_id?: {
    _id: string;
    filename: string;
    originalName: string;
    mimetype: string;
    path: string;
  };
}

interface RecentRequestsTableProps {
  data: {
    recentActivity: RecentRequest[];
  } | null;
  loading: boolean;
  filterCategory?: 'total' | 'pending' | 'approved' | 'rejected' | null;
}

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: 'Approved'
        };
      case 'rejected':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Rejected'
        };
      default:
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          label: 'Pending'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

interface RecentRequestsTableProps {
  data: {
    recentActivity: RecentRequest[];
  } | null;
  loading: boolean;
}

const RecentRequestsTable: React.FC<RecentRequestsTableProps> = memo(({ data, loading, filterCategory }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-5 md:h-6 bg-gray-200 dark:bg-gray-600 rounded w-32 md:w-48 mb-4 md:mb-6"></div>
          <div className="space-y-3 md:space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-3 md:h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data?.recentActivity || data.recentActivity.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">Recent Requests</h3>
        <div className="text-center py-6 md:py-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">No recent requests found</p>
        </div>
      </div>
    );
  }

  // Filter data based on category
  const filteredData = filterCategory ? data.recentActivity.filter(request => {
    switch (filterCategory) {
      case 'pending':
        return request.status === 'pending';
      case 'approved':
        return request.status === 'approved';
      case 'rejected':
        return request.status === 'rejected';
      case 'total':
      default:
        return true; // Show all requests for total or no filter
    }
  }) : data.recentActivity;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Recent Requests</h3>
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">Latest cost rate approval requests</p>
      </div>

      {/* Mobile view - DataTable handles responsive design */}
      <div className="block md:hidden">
        {!loading && filteredData.length === 0 ? (
          <NoData 
            title="No Requests Found"
            message="There are no requests to display at the moment."
            className="py-8"
          />
        ) : (
          <DataTable
            columns={[
              {
                label: "Reference",
                key: "reference_number",
                render: (item: RecentRequest) => (
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{item.reference_number}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.part?.code || 'N/A'}</div>
                  </div>
                )
              },
              {
                label: "Process",
                key: "process",
                render: (item: RecentRequest) => (
                  <div className="text-sm text-gray-900 dark:text-white">{item.process?.process || 'N/A'}</div>
                )
              },
              {
                label: "Plant",
                key: "resource_group",
                render: (item: RecentRequest) => (
                  <div className="text-sm text-gray-900 dark:text-white">{item.resource_group?.location || 'N/A'}</div>
                )
              },
              {
                label: "Cost",
                key: "proposed_cost",
                render: (item: RecentRequest) => (
                  <div className="text-sm text-gray-900 dark:text-white">₹{item.proposed_cost?.toLocaleString() || '0'}</div>
                )
              },
              {
                label: "Status",
                key: "status",
                render: (item: RecentRequest) => <StatusBadge status={item.status} />
              }
            ]}
            data={filteredData.slice(0, 10)}
            loading={loading}
            rowKey="_id"
            skeletonRowCount={5}
          />
        )}
      </div>

      {/* Desktop view - DataTable */}
      <div className="hidden md:block">
        {!loading && filteredData.length === 0 ? (
          <NoData 
            title="No Requests Found"
            message="There are no requests to display at the moment."
            className="py-8"
          />
        ) : (
          <DataTable
            columns={[
              {
                label: "Resource Group",
                key: "resource_group",
                render: (item: RecentRequest) => (
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {item.resource_group?.code || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {Array.isArray(item.resource_group?.location) ? item.resource_group.location.join(', ') : (item.resource_group?.location || 'N/A')}
                    </div>
                  </div>
                )
              },
              {
                label: "Process",
                key: "process",
                render: (item: RecentRequest) => {
                  const processName = typeof item.process === 'string' ? item.process : item.process?.process;
                  return (
                    <div 
                      className="text-xs text-gray-600 max-w-[120px] cursor-help truncate" 
                      title={processName || 'No process available'}
                    >
                      {processName || '-'}
                    </div>
                  );
                }
              },
              {
                label: "Part Info",
                key: "partInfo",
                render: (item: RecentRequest) => (
                  <div className="space-y-1 group relative">
                    <div className="font-semibold text-xs">{item.part?.code || 'N/A'}</div>
                    <div 
                      className="text-xs text-gray-600 max-w-[120px] cursor-help truncate" 
                      title={item.part?.description || 'No description available'}
                    >
                      {item.part?.description || '-'}
                    </div>
                  </div>
                )
              },
              {
                label: "Existing Cost",
                key: "existingCost",
                render: (item: RecentRequest) => {
                  // Get existing cost from costHistory array (first/most recent record)
                  const existingCost = item.costHistory && item.costHistory.length > 0 
                    ? item.costHistory[0].unit_cost 
                    : null;
                  const standardCost = item.standard_cost;

                  let deviationPercentage = null;
                  let deviationColor = "bg-gray-100 text-gray-600";

                  if (existingCost && standardCost && standardCost > 0) {
                    deviationPercentage = ((standardCost - existingCost) / existingCost) * 100;
                    if (deviationPercentage > 0) {
                      deviationColor = "bg-red-100 text-red-800"; // Higher than existing
                    } else if (deviationPercentage < 0) {
                      deviationColor = "bg-green-100 text-green-800"; // Lower than existing
                    } else {
                      deviationColor = "bg-blue-100 text-blue-800"; // Same as existing
                    }
                  }

                  return (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-gray-500">Price:</span>
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800">
                          {existingCost ? `Rs.${existingCost.toLocaleString()}` : 'N/A'}
                        </span>
                      </div>
                      {deviationPercentage !== null && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-gray-500">Deviation:</span>
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${deviationColor}`}>
                            {deviationPercentage > 0 ? '+' : ''}{deviationPercentage.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }
              },
              {
                label: "Labour Costs",
                key: "labourCosts",
                render: (item: RecentRequest) => (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-gray-500">Skilled:</span>
                      <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                        {item.skilled_rate ? item.skilled_rate.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-gray-500">Unskilled:</span>
                      <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                        {item.unskilled_rate ? item.unskilled_rate.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                )
              },
              {
                label: "Total Costs",
                key: "totalCosts",
                render: (item: RecentRequest) => {
                  // Calculate deviation between standard and proposed cost
                  const standardToProposedDeviation = item.standard_cost && item.proposed_cost 
                    ? item.proposed_cost - item.standard_cost 
                    : 0;

                  // Calculate deviation percentage from standard cost
                  const deviationPercent = item.standard_cost && standardToProposedDeviation !== 0 
                    ? ((standardToProposedDeviation / item.standard_cost) * 100).toFixed(1)
                    : '0.0';

                  return (
                    <div className="space-y-2">
                      {/* Standard Cost */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-gray-500">Standard:</span>
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                          {item.standard_cost ? `Rs.${item.standard_cost.toLocaleString()}` : 'N/A'}
                        </span>
                      </div>

                      {/* Proposed Cost */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-gray-500">Proposed:</span>
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">
                        {item.proposed_cost ? item.proposed_cost.toLocaleString() : 'N/A'}
                        </span>
                      </div>

                      {/* Deviation between Standard and Proposed */}
                      {item.standard_cost && item.proposed_cost && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-gray-500">Deviation:</span>
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            standardToProposedDeviation > 0 
                              ? 'bg-red-100 text-red-800' 
                              : standardToProposedDeviation < 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {standardToProposedDeviation > 0 ? '+' : ''}{standardToProposedDeviation.toLocaleString()} 
                            <span className={`ml-1 ${
                              standardToProposedDeviation > 0 
                                ? 'text-red-600' 
                                : standardToProposedDeviation < 0 
                                  ? 'text-green-600' 
                                  : 'text-gray-600'
                            }`}>
                              ({deviationPercent}%)
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }
              },
              {
                label: "Date Range",
                key: "dateRange",
                render: (item: RecentRequest) => (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-gray-500">Start:</span>
                      <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-gray-500">End:</span>
                      <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                )
              },
              {
                label: "Levels",
                key: "levels",
                render: (item: RecentRequest) => (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-gray-500">Current:</span>
                      {typeof item.current_level === 'object' && item.current_level?.name ? (
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                          {item.current_level.name} (L{item.current_level.value})
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">N/A</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-gray-500">Approver:</span>
                      {item.current_level_user && Array.isArray(item.current_level_user) && item.current_level_user.length > 0 ? (
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800">
                          {item.current_level_user.map((user: any) => user.name).join(', ')}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600">
                          No Approver
                        </span>
                      )}
                    </div>
                  </div>
                )
              },
              {
                label: "Document",
                key: "document",
                render: (item: RecentRequest) => {
                  if (item.document_id) {
                    return (
                      <div className="flex-row items-center justify-between gap-1">
                        <span className="text-xs text-gray-600 truncate max-w-[80px]" title={item.document_id.originalName}>
                          {item.document_id.originalName}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => item.document_id ? window.open(`/api/documents/download/${item.document_id._id}`, '_blank') : undefined}
                            className="bg-blue-500 hover:bg-blue-600 px-1 py-0.5 text-xs rounded w-5 h-5 flex items-center justify-center"
                            title="Preview Document"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-2 8a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <span className="text-xs text-gray-400">No attachment</span>
                    );
                  }
                }
              },
              {
                label: "Status",
                key: "status",
                render: (item: RecentRequest) => <StatusBadge status={item.status} />
              }
            ]}
            data={filteredData.slice(0, 10)}
            loading={loading}
            rowKey="_id"
            skeletonRowCount={5}
          />
        )}
      </div>

      {filteredData.length > 10 && (
        <div className="px-4 md:px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
            Showing 10 of {filteredData.length} recent requests
          </div>
        </div>
      )}
    </div>
  );
});

RecentRequestsTable.displayName = 'RecentRequestsTable';

export default RecentRequestsTable;
export type { RecentRequest };
