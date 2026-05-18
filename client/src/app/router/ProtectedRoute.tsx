import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { usePermissions } from '../../hooks/usePermissions'; 

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Array<{
    module: string;
    action: string;
    isHeading?: boolean;
  }>;
  fallbackPath?: string;
  showUnauthorized?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermissions = [], 
  fallbackPath = '/dashboard',
  showUnauthorized = false
}) => {
  const { hasPermission, hasModulePermission, loading, permissions } = usePermissions();
  const location = useLocation();
  const user = useSelector((state: any) => state.auth.user);
  
  // Show loading state while permissions are being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Super admin bypass - show all routes if user is super admin
  // Check both direct role assignment and role name
  const userRole = typeof user?.role === 'string' 
    ? user.role.toLowerCase().replace(/\s+/g, '')
    : user?.role?.role?.toLowerCase().replace(/\s+/g, '');
    
  if (userRole === 'superadmin') {
    return <>{children}</>;
  }
  
  // If no permissions required, allow access
  if (requiredPermissions.length === 0) {
    return <>{children}</>;
  }
  
  // If permissions are still loading or not yet fetched, show loading
  if (loading || permissions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Check if user has any of the required permissions
  const hasRequiredPermission = requiredPermissions.some(({ module, action, isHeading }) => {
    if (isHeading) {
      // For heading permissions, check if user has any permission in the module
      return hasModulePermission(module, ['create', 'read', 'update', 'delete']);
    } else {
      // For specific permissions, check exact match
      return hasPermission(module, action);
    }
  });
  
  if (!hasRequiredPermission) {
    // Store attempted location for redirect after login/permission update
    localStorage.setItem('redirectPath', location.pathname);
    
    if (showUnauthorized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
    
    // Redirect to fallback path instead of showing login toast
    return <Navigate to={fallbackPath} replace />;
  }
  
  // Clear redirect path if user has access
  localStorage.removeItem('redirectPath');
  
  return <>{children}</>;
};

export default ProtectedRoute;
