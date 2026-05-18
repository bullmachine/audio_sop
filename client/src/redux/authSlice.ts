import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { STORAGE_KEYS } from "../services/storage";
import { apiRequest } from "../services/axios";
import { isTokenExpired } from "../services/jwt";

export interface Permission {
  _id: string;
  name: string;
  description: string;
  module: string;
  action: string;
  isHeading: boolean;
  active: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  empCode?: string;
  mobile?: string;
  role?: {
    id: string;
    name: string;
    permissions: string[];
    slug: string;
  };
  permissions?: Permission[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RefreshResponse {
  token: string;
};


interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  permissions: Permission[];
  loading: boolean;
  permissionsLoaded: boolean;
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.TOKEN),
  user: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || "null"),
  token: localStorage.getItem(STORAGE_KEYS.TOKEN),
  permissions: [],
  loading: false,
  permissionsLoaded: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<AuthResponse>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      // Don't set permissions from login - they come from fetchUserPermissions
      state.loading = false;
      state.permissionsLoaded = false; // Reset so permissions will be fetched

      localStorage.setItem(STORAGE_KEYS.TOKEN, action.payload.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.permissions = [];
      state.loading = false;
      state.permissionsLoaded = false;

      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      // Clear permission cache on logout
      import('../services/permissionCache').then(({ permissionCache }) => {
        permissionCache.clear();
      });
    },
    setPermissions: (state, action: PayloadAction<Permission[]>) => {
      state.permissions = action.payload;
      // Clear cache when permissions are manually set (e.g., by admin updates)
      import('../services/permissionCache').then(({ permissionCache }) => {
        permissionCache.clear();
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPermissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
        state.permissionsLoaded = true;
      })
      .addCase(fetchUserPermissions.rejected, (state) => {
        state.loading = false;
        state.permissions = [];
        state.permissionsLoaded = false; // Allow retry on failure
      });
  },
});

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { dispatch }) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const user = localStorage.getItem(STORAGE_KEYS.USER);

    try {
      if (token && user) {
        // Check if token is expired
        if (!isTokenExpired(token)) {
          dispatch(
            login({
              token: token,
              user: JSON.parse(user),
            })
          );
          return;
        }

        // Token expired, try refresh
        const response = await apiRequest.post<RefreshResponse>("/auth/refresh", {}, { withCredentials: true });
        const newToken = response.token;

        localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);

        dispatch(
          login({
            token: newToken,
            user: JSON.parse(user),
          })
        );
      } else {
        dispatch(logout());
      }
    } catch (err) {
      dispatch(logout());
    }
  }
);

export const fetchUserPermissions = createAsyncThunk(
  "auth/user-permissions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const userId = state.auth.user?.id;

      // Check cache first
      if (userId) {
        const { permissionCache } = await import('../services/permissionCache');
        const cachedPermissions = permissionCache.get(userId);
        if (cachedPermissions) {
          console.log('Using cached permissions');
          return cachedPermissions;
        }
      }

      // Fetch from API if not in cache
      console.log('Fetching permissions from API');
      const response = await apiRequest.get('/auth/user-permissions') as any;
      const permissions = response.permissions || [];

      // Store in cache
      if (userId) {
        const { permissionCache } = await import('../services/permissionCache');
        permissionCache.set(permissions, userId);
      }

      return permissions;
    } catch (error: any) {
      console.error('Thunk - API Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch permissions');
    }
  }
);

export const { login, logout, setPermissions } = authSlice.actions;
export default authSlice.reducer;
