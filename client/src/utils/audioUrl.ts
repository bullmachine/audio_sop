import { API_BASE_URL, ASSET_URL, STORAGE_KEYS } from "../services/storage";

/** Backend origin for static uploads (no /api suffix). */
export const getUploadsBaseUrl = (): string => {
  const fromEnv = import.meta.env.VITE_ASSET_URL || ASSET_URL;
  if (fromEnv) {
    return String(fromEnv).replace(/\/$/, "");
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || API_BASE_URL || STORAGE_KEYS.API_BASE_URL;
  return String(apiBase).replace(/\/api\/?$/, "").replace(/\/$/, "");
};

/** Always load audio from the backend server, not the Vite dev server. */
export const getAudioUrl = (filePath: string): string => {
  if (!filePath) return "";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  const normalized = filePath.startsWith("/") ? filePath : `/${filePath}`;
  return `${getUploadsBaseUrl()}${normalized}`;
};
