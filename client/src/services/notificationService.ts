import type { Notification } from '../types/notification';
import { io, Socket } from 'socket.io-client';

class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private subscribers: Set<() => void> = new Set();
  private socket: Socket | null = null;
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize Socket.IO connection for real-time notifications
  initializeSocketIO(userId: string) {
    this.userId = userId;
    
    // Close existing Socket.IO connection
    if (this.socket) {
      this.socket.disconnect();
    }
 

    // Connect to Socket.IO server with timeout handling
    const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8000';
    this.socket = io(socketUrl, {
      query: { userId },
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    this.socket.on('connect', () => {
      // Join user-specific room
      this.socket?.emit('join_user_room', { userId }); 
    });

    this.socket.on('connect_error', (error) => { 
      
      // Handle different types of connection errors
      if (error.message?.includes('timeout')) {
        console.error('⏰ Connection timeout - server may be down or slow');
      } else if (error.message?.includes('ECONNREFUSED') || error.message?.includes('websocket error')) {
        console.error('🚫 Connection refused - Socket.IO server not running on port 8000');
        console.error('💡 Solution: Start the backend Socket.IO server');
        console.error('📋 Backend should be running on: http://localhost:8000');
        console.error('🔧 Check: npm run start in backend directory');
      } else if (error.message?.includes('Network error')) {
        console.error('🌐 Network error - check internet connection');
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason);
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (this.userId) {
          console.log('🔄 Attempting to reconnect...');
          this.initializeSocketIO(this.userId);
        }
      }, 5000);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket.IO reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Socket.IO reconnection attempt:', attemptNumber);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Socket.IO reconnection failed - giving up');
    });

    this.socket.on('notification', (data: Notification) => {
      console.log('Received notification:', data);
      this.addNotification(data);
    });

    this.socket.on('request_created', (data: any) => {
      console.log('Request created:', data);
      const notification: Notification = {
        _id: Date.now().toString(),
        type: 'success',
        title: 'Request Created',
        message: `New request ${data.part?.code || ''} has been created`,
        entityType: 'request',
        entityId: data._id,
        action: 'created',
        isRead: false,
        userId: this.userId || undefined,
        createdAt: new Date().toISOString(),
        data
      };
      this.addNotification(notification);
    });

    this.socket.on('request_updated', (data: any) => {
      console.log('Request updated:', data);
      const notification: Notification = {
        _id: Date.now().toString(),
        type: 'info',
        title: 'Request Updated',
        message: `Request ${data.part?.code || ''} has been updated`,
        entityType: 'request',
        entityId: data._id,
        action: 'updated',
        isRead: false,
        userId: this.userId || undefined,
        createdAt: new Date().toISOString(),
        data
      };
      this.addNotification(notification);
    });

    this.socket.on('level_changed', (data: any) => {
      console.log('Level changed:', data);
      // Only notify if this user is the request creator
      if (data.createdBy === this.userId) {
        const notification: Notification = {
          _id: Date.now().toString(),
          type: 'success',
          title: 'Request Level Changed',
          message: `Your request ${data.part?.code || ''} is now at Level ${data.currentLevel?.name || data.currentLevel || 'Unknown'}`,
          entityType: 'request',
          entityId: data._id,
          action: 'level_changed',
          isRead: false,
          userId: this.userId || undefined,
          createdAt: new Date().toISOString(),
          data
        };
        this.addNotification(notification);
      }
    });

    this.socket.on('level_pending', (data: any) => {
      console.log('Request pending for level:', data);
      const notification: Notification = {
        _id: Date.now().toString(),
        type: 'warning',
        title: 'Request Pending Approval',
        message: `Request ${data.part?.code || data.part?.name || `#${data._id?.slice(-6)}`} is pending your approval at Level ${data.currentLevel?.name || data.currentLevel?.value}`,
        entityType: 'request',
        entityId: data._id,
        action: 'pending_approval',
        isRead: false,
        userId: this.userId || undefined,
        createdAt: new Date().toISOString(),
        data
      };
      this.addNotification(notification);
    });

    this.socket.on('level_approved', (data: any) => {
      console.log('Request approved at level:', data);
      const notification: Notification = {
        _id: Date.now().toString(),
        type: 'success',
        title: 'Request Approved',
        message: `Request ${data.part?.code || data.part?.name || `#${data._id?.slice(-6)}`} has been approved at Level ${data.currentLevel?.name || data.currentLevel?.value}`,
        entityType: 'request',
        entityId: data._id,
        action: 'approved_at_level',
        isRead: false,
        userId: this.userId || undefined,
        createdAt: new Date().toISOString(),
        data
      };
      this.addNotification(notification);
    });

    this.socket.on('level_rejected', (data: any) => {
      console.log('Request rejected at level:', data);
      const notification: Notification = {
        _id: Date.now().toString(),
        type: 'error',
        title: 'Request Rejected',
        message: `Request ${data.part?.code || data.part?.name || `#${data._id?.slice(-6)}`} has been rejected at Level ${data.currentLevel?.name || data.currentLevel?.value}${data.rejectionReason ? `: ${data.rejectionReason}` : ''}`,
        entityType: 'request',
        entityId: data._id,
        action: 'rejected_at_level',
        isRead: false,
        userId: this.userId || undefined,
        createdAt: new Date().toISOString(),
        data
      };
      this.addNotification(notification);
    });

    
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (this.userId) {
          console.log('🔄 Attempting to reconnect...');
          this.initializeSocketIO(this.userId);
        }
      }, 5000);
    });

    this.socket.on('error', (error: any) => {
      console.error('❌ Socket.IO error:', error);
    });
  }

  // Subscribe to notification changes
  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Notify all subscribers
  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  // Add new notification
  addNotification(notification: Notification) {
    this.notifications.unshift(notification);
    this.notifySubscribers();
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return this.notifications;
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n._id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.notifySubscribers();
    }
  }

  // Mark all as read
  markAllAsRead() {
    this.notifications.forEach(n => {
      n.isRead = true;
    });
    this.notifySubscribers();
  }

  // Clear notifications
  clearNotifications() {
    this.notifications = [];
    this.notifySubscribers();
  }

  // Handle notification click (essential for navigation)
  handleNotificationClick(notification: Notification) {
    // Mark as read
    this.markAsRead(notification._id);

    // Handle different notification types
    switch (notification.action) {
      case 'login':
        // Show user info or dashboard
        window.location.hash = '/dashboard';
        break;
        
      case 'logout':
        // Redirect to login
        window.location.hash = '/login';
        break;
        
      case 'created':
      case 'updated':
      case 'level_changed':
      case 'pending_approval':
      case 'approved_at_level':
      case 'rejected_at_level':
        // Navigate to request details page with request_id parameter
        if (notification.entityType === 'request' && notification.entityId) {
          window.location.hash = `/request-list?request_id=${notification.entityId}`;
        }
        break;
        
      case 'deleted':
        // Navigate to list if entity was deleted
        if (notification.entityType === 'request') {
          window.location.hash = '/requests';
        }
        break;
        
      default:
        // For other notifications, show general notification panel
        window.location.hash = '/notifications';
        break;
    }
  }

  // Test connection status
  getConnectionStatus() {
    return {
      connected: this.socket?.connected || false,
      userId: this.userId,
      socketId: this.socket?.id,
      url: import.meta.env.VITE_WS_URL || 'http://localhost:8000'
    };
  }

  close() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.userId = null;
  }
}

export default NotificationService.getInstance();
