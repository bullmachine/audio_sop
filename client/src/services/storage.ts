
export const STORAGE_PREFIX = 'rate_approval_';

// Centralized storage keys
export const STORAGE_KEYS = {
  TOKEN: `${STORAGE_PREFIX}token`,
  USER: `${STORAGE_PREFIX}user`,
  THEME: `${STORAGE_PREFIX}theme`,
  FORMDATA: `${STORAGE_PREFIX}form_data`,

  // Fallback for development
  BASE_URL: 'http://192.168.1.33/rate-approval/',
  API_BASE_URL: 'http://localhost:8000/api',
  ASSET_URL: 'http://localhost:8000',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Centralized base URL using Vite environment variables
const rawAppBase = import.meta.env.VITE_APP_BASE_URL
  || STORAGE_KEYS.BASE_URL; // Fall back to the default URL from STORAGE_KEYS if the env variable is not found
export const APP_BASE_URL: string = rawAppBase.endsWith('/') ? rawAppBase : `${rawAppBase}/`;

// Centralized API base URL using Vite environment variables
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL
  || STORAGE_KEYS.API_BASE_URL; // Fall back to the default API base URL from STORAGE_KEYS if the env variable is not found

// Centralized Asset URL using Vite environment variables
export const ASSET_URL: string = import.meta.env.VITE_ASSET_URL
  || STORAGE_KEYS.ASSET_URL; // Fall back to the default asset URL from STORAGE_KEYS if the env variable is not found

