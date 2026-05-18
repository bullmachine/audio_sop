// Permission cache utilities for localStorage
const PERMISSION_CACHE_KEY = 'user_permissions_cache';
const CACHE_EXPIRY_HOURS = 24; // Cache expires after 24 hours

export interface PermissionCache {
  permissions: any[];
  timestamp: number;
  userId: string;
}

export const permissionCache = {
  // Store permissions in localStorage with timestamp
  set: (permissions: any[], userId: string) => {
    const cache: PermissionCache = {
      permissions,
      timestamp: Date.now(),
      userId
    };
    localStorage.setItem(PERMISSION_CACHE_KEY, JSON.stringify(cache));
  },

  // Get cached permissions if valid
  get: (userId: string): any[] | null => {
    try {
      const cacheStr = localStorage.getItem(PERMISSION_CACHE_KEY);
      if (!cacheStr) return null;

      const cache: PermissionCache = JSON.parse(cacheStr);

      // Check if cache is for the same user
      if (cache.userId !== userId) return null;

      // Check if cache is expired
      const cacheAge = Date.now() - cache.timestamp;
      const maxAge = CACHE_EXPIRY_HOURS * 60 * 60 * 1000; // Convert hours to milliseconds

      if (cacheAge > maxAge) {
        // Cache expired, remove it
        permissionCache.clear();
        return null;
      }

      return cache.permissions;
    } catch (error) {
      // Invalid cache, remove it
      permissionCache.clear();
      return null;
    }
  },

  // Clear cache
  clear: () => {
    localStorage.removeItem(PERMISSION_CACHE_KEY);
  },

  // Check if cache exists and is valid
  isValid: (userId: string): boolean => {
    return permissionCache.get(userId) !== null;
  }
};
