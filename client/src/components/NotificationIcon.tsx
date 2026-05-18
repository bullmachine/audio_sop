import React from 'react';

interface NotificationIconProps {
  type: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ type, className = '' }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className={`w-5 h-5 text-green-500 ${className}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 00-8-8 8 8 0 018 8zm3.5-9a3.5 3.5 0 00-3.5 3.5 3.5 0 003.5-3.5 3.5 0 00-3.5 3.5z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={`w-5 h-5 text-yellow-500 ${className}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 2.722 0 00-2.722 1.36l-1.824.637c-1.318.562-2.722.562-2.722 0 00-.562 2.722l1.824.637zm1.824 1.637c.653.653 1.824.653 2.722 0 002.722-1.653-1.824-.653l-1.824-1.637z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className={`w-5 h-5 text-red-500 ${className}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 00-8-8 8 8 0 018 8zm3.5-9a3.5 3.5 0 00-3.5 3.5 3.5 0 00-3.5 3.5z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className={`w-5 h-5 text-blue-500 ${className}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 00-1 1H4a1 1 0 001 1v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 00-1-1zm2 4a1 1 0 011-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1 1h2a1 1 0 011 1v2a1 1 0 001 1h6a1 1 0 001-1v-2a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return getIcon();
};

export default NotificationIcon;
