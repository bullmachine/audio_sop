import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import type { Notification, NotificationState } from '../types/notification';
import { STORAGE_KEYS } from '../services/storage';

export const useNotifications = () => {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    loading: false
  });

  // Subscribe to notification service changes
  useEffect(() => {
    const unsubscribe = notificationService.subscribe(() => {
      const notifications = notificationService.getNotifications();
      const unreadCount = notificationService.getUnreadCount();
      
      setState({
        notifications,
        unreadCount,
        loading: false
      });
    });

    // Initial load
    setState(prev => ({ ...prev, loading: true }));
    const notifications = notificationService.getNotifications();
    const unreadCount = notificationService.getUnreadCount();
    
    setState({
      notifications,
      unreadCount,
      loading: false
    });

    return unsubscribe;
  }, []);

  // Initialize Socket.IO when user is available
  useEffect(() => {
    // Get user from localStorage using correct storage key
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    console.log('🔍 Checking localStorage contents:');
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('📋 User string from localStorage:', userStr);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('👤 Parsed user object:', user);
        console.log('🆔 User ID:', user._id || user.id);
        console.log('👑 User name:', user.name);
        
        // Handle both 'id' and '_id' fields
        const userId = user._id || user.id;
        
        if (userId) {
          console.log('🚀 Initializing notifications for user:', userId);
          // Use Socket.IO instead of WebSocket
          notificationService.initializeSocketIO(userId);
          
          // Log connection status after 2 seconds
          setTimeout(() => {
            const status = notificationService.getConnectionStatus();
            console.log('📊 Socket.IO connection status:', status);
          }, 2000);
        } else {
          console.warn('⚠️ No user ID found in user data');
          console.log('🔍 Available user properties:', Object.keys(user));
        }
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
      }
    } else {
      console.warn('⚠️ No user found in localStorage');
      
      // Check if user might be stored under different key
      const possibleKeys = ['user', 'authUser', 'currentUser', 'userData'];
      possibleKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          console.log(`🔑 Found data under key '${key}':`, data);
        }
      });
    }
  }, []);

  // Get all notifications (filtering removed as it's not currently used)
  const filteredNotifications = notificationService.getNotifications();

  // DRY notification actions
  const actions = {
    // Mark notification as read
    markAsRead: useCallback((notificationId: string) => {
      notificationService.markAsRead(notificationId);
      const notifications = notificationService.getNotifications();
      const unreadCount = notificationService.getUnreadCount();
      
      setState({
        notifications,
        unreadCount,
        loading: false
      });
    }, []),

    // Mark all as read
    markAllAsRead: useCallback(() => {
      notificationService.markAllAsRead();
      const notifications = notificationService.getNotifications();
      const unreadCount = notificationService.getUnreadCount();
      
      setState({
        notifications,
        unreadCount,
        loading: false
      });
    }, []),

    // Clear all notifications
    clearNotifications: useCallback(() => {
      notificationService.clearNotifications();
      setState({
        notifications: [],
        unreadCount: 0,
        loading: false
      });
    }, []),

    // Handle notification click (DRY - centralized click handling)
    handleNotificationClick: useCallback((notification: Notification) => {
      notificationService.handleNotificationClick(notification);
      
      // Update local state immediately
      const notifications = notificationService.getNotifications();
      const unreadCount = notificationService.getUnreadCount();
      
      setState({
        notifications,
        unreadCount,
        loading: false
      });
    }, []),

    // Update filters
    // Note: Filtering functionality removed as it's not currently used
    
    // Add notification manually (for system events)
    addNotification: useCallback((notification: Omit<Notification, '_id'>) => {
      const newNotification: Notification = {
        ...notification,
        _id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isRead: false
      };
      
      notificationService.addNotification(newNotification);
      
      const notifications = notificationService.getNotifications();
      const unreadCount = notificationService.getUnreadCount();
      
      setState({
        notifications,
        unreadCount,
        loading: false
      });
    }, [])
  };

  return {
    ...state,
    filteredNotifications,
    ...actions
  };
};
