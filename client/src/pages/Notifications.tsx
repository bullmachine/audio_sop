import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationIcon from '../components/NotificationIcon';

const Notifications: React.FC = () => {
  const { 
    filteredNotifications, 
    markAllAsRead, 
    handleNotificationClick
  } = useNotifications();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View and manage all your notifications
          </p>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2h8a2 2 0 002-2v-7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m13 16 5-4 4 4 0 014-4 4h4a2 2 0 012-2v6a2 2 0 01-2-2h-4a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check back later for new notifications.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Notification Icon */}
                    <NotificationIcon 
                      type={notification.type} 
                      className="flex-shrink-0 mt-0.5" 
                    />

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title and Read Status */}
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>

                      {/* Message */}
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {notification.message}
                      </p>

                      {/* Metadata */}
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {notification.entityType && (
                            <>
                              {notification.entityType.charAt(0).toUpperCase() + notification.entityType.slice(1)} • 
                              {notification.action && (
                                notification.action.replace('_', ' ').toUpperCase()
                              )}
                            </>
                          )}
                        </span>
                        <span>
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {filteredNotifications.length > 0 && (
          <div className="mt-6 flex gap-2">
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Mark All as Read
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
