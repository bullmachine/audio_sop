export interface Notification {
  _id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  entityId?: string;
  entityType?: 'request' | 'user' | 'system';
  action?: 'created' | 'updated' | 'deleted' | 'level_changed' | 'login' | 'logout' | 'pending_approval' | 'approved_at_level' | 'rejected_at_level';
  isRead: boolean;
  userId?: string;
  createdAt: string;
  data?: any; // Additional data for specific notifications
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
}
