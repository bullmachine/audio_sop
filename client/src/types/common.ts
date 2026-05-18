export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export const CostType = {
  RESOURCE_GROUP_COST: 'resource_group_cost',
  CONTRACT_ITEM_COST: 'contract_item_cost'
} as const;

export type CostType = typeof CostType[keyof typeof CostType];

export interface PaginationParams {
  page: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Role extends BaseEntity {
  role: string;
  description: string;
}

export interface User extends BaseEntity {
  name: string;
  empCode: string;
  email: string;
  mobile?: string;
  role?: Role;
}

export interface Permission {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface TableColumn<T = any> {
  label: string;
  key: string;
  render?: (item: T) => React.ReactNode;
}
