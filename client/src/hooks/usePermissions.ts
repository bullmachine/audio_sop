import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import type { Permission } from '../redux/authSlice';

export const usePermissions = () => {
  const permissions = useSelector((state: RootState) => state.auth.permissions || []);
  const loading = useSelector((state: RootState) => state.auth.loading); 

  const hasPermission = (module: string, action: string) => {
    return permissions.some((permission: Permission) =>
      permission.module === module && permission.action === action && permission.active
    );
  };

  const hasModulePermission = (module: string, actions: string[] = []) => {
    return permissions.some((permission: Permission) =>
      permission.module === module &&
      actions.includes(permission.action) &&
      permission.active
    );
  };

  const hasAnyPermission = (modulePermissions: { module: string; actions: string[] }[]) => {
    return modulePermissions.some(({ module, actions }) =>
      permissions.some((permission: Permission) =>
        permission.module === module &&
        actions.includes(permission.action) &&
        permission.active
      )
    );
  };

  const hasAnyModuleAccess = (modules: string[]) => {
    return permissions.some((permission: Permission) =>
      modules.includes(permission.module) && permission.active
    );
  };

  const getPermissionsByModule = (module: string) => {
    return permissions.filter((permission: Permission) =>
      permission.module === module && permission.active
    );
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasModulePermission,
    hasAnyPermission,
    hasAnyModuleAccess,
    getPermissionsByModule
  };
};
