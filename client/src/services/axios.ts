import axios, {
    type AxiosError,
    type AxiosRequestConfig,
    type AxiosResponse,
} from "axios";
import { STORAGE_KEYS, API_BASE_URL, APP_BASE_URL } from "./storage";

/**
 * Redirect user to login (used only when refresh fails)
 */
const handleUnauthorized = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    window.location.href = APP_BASE_URL + '#/login';
    return Promise.reject(new Error("Unauthorized"));
};

/**
 * Axios instance
 */
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

/**
 * ===============================
 * REQUEST INTERCEPTOR
 * ===============================
 * Attach access token to every request
 */
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * ===============================
 * REFRESH TOKEN STATE
 * ===============================
 */
let isRefreshing = false;

type FailedRequest = {
    resolve: (token: string) => void;
    reject: (error: any) => void;
};

let failedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: string | null) => {
    failedQueue.forEach((promise) => {
        if (error) promise.reject(error);
        else promise.resolve(token!);
    });
    failedQueue = [];
};

/**
 * ===============================
 * RESPONSE INTERCEPTOR
 * ===============================
 */
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,

    async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // Only handle 401 errors
        if (error.response?.status === 401 && !originalRequest?._retry) {
            // If we've already tried to refresh, log out
            if (originalRequest.url === '/auth/refresh') {
                return handleUnauthorized();
            }

            originalRequest._retry = true;

            // If refresh already in progress, queue request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(apiClient(originalRequest));
                        },
                        reject,
                    });
                });
            }

            isRefreshing = true;

            try {
                // Make sure to include credentials for the refresh request
                const response = await apiClient.post('/auth/refresh', {}, { withCredentials: true });

                const newToken = response.data.token;

                // Update the stored access token
                localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);

                // Retry all queued requests
                processQueue(null, newToken);

                // Update the authorization header
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed → logout user
                processQueue(refreshError, null);
                return handleUnauthorized();
            } finally {
                isRefreshing = false;
            }
        }

        // Handle other errors
        return Promise.reject(error);
    }
);

/**
 * ===============================
 * apiRequest helper
 * ===============================
 */
 
type ApiRequestConfig = AxiosRequestConfig;

export const apiRequest = {
    get: <T>(url: string, config?: ApiRequestConfig): Promise<T> =>
        apiClient
            .get<T>(url, config)
            .then((res) => res.data)
            .catch(handleApiError),

    post: <T>(url: string, data?: any, config?: ApiRequestConfig): Promise<T> =>
        apiClient
            .post<T>(url, data, config)
            .then((res) => res.data)
            .catch(handleApiError),

    put: <T>(url: string, data?: any, config?: ApiRequestConfig): Promise<T> =>
        apiClient
            .put<T>(url, data, config)
            .then((res) => res.data)
            .catch(handleApiError),

    patch: <T>(url: string, data?: any, config?: ApiRequestConfig): Promise<T> =>
        apiClient
            .patch<T>(url, data, config)
            .then((res) => res.data)
            .catch(handleApiError),

    delete: <T>(url: string, config?: ApiRequestConfig): Promise<T> =>
        apiClient
            .delete<T>(url, config)
            .then((res) => res.data)
            .catch(handleApiError),
};
const handleApiError = (error: unknown): never => {
    if (axios.isAxiosError(error)) {
        throw new Error(
            (error.response?.data as any)?.error ||
            (error.response?.data as any)?.message ||
            error.message ||
            "An error occurred"
        );
    }
    throw error;
};


export default apiClient;
