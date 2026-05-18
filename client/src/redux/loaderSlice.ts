import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

// Loader state interface
export interface LoaderState {
  isAnimating: boolean;
  progress: number;
  cyclePosition: number;
  speed: number;
  isVisible: boolean;
  message?: string;
  error?: string;
}

// Initial state
const initialState: LoaderState = {
  isAnimating: false,
  progress: 0,
  cyclePosition: 0,
  speed: 1,
  isVisible: false,
  message: undefined,
  error: undefined,
};

// Async thunks for loader operations
export const startLoader = createAsyncThunk(
  'loader/start',
  async (message?: string) => {
    return { message };
  }
);

export const stopLoader = createAsyncThunk(
  'loader/stop',
  async () => {
    return {};
  }
);

export const setProgress = createAsyncThunk(
  'loader/setProgress',
  async (progress: number) => {
    return { progress: Math.min(100, Math.max(0, progress)) };
  }
);

// Loader slice
const loaderSlice = createSlice({
  name: 'loader',
  initialState,
  reducers: {
    setLoaderState: (state, action: PayloadAction<Partial<LoaderState>>) => {
      Object.assign(state, action.payload);
    },
    updateProgress: (state, action: PayloadAction<number>) => {
      state.progress = Math.min(100, Math.max(0, action.payload));
    },
    updateCyclePosition: (state, action: PayloadAction<number>) => {
      state.cyclePosition = action.payload % 1;
    },
    setSpeed: (state, action: PayloadAction<number>) => {
      state.speed = Math.max(0.1, Math.min(3, action.payload));
    },
    showLoader: (state, action: PayloadAction<string | undefined>) => {
      state.isVisible = true;
      state.isAnimating = true;
      state.message = action.payload;
      state.error = undefined;
    },
    hideLoader: (state) => {
      state.isVisible = false;
      state.isAnimating = false;
      state.progress = 0;
      state.cyclePosition = 0;
      state.message = undefined;
      state.error = undefined;
    },
    setLoaderError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isAnimating = false;
    },
    resetLoader: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startLoader.pending, (state) => {
        state.isAnimating = true;
        state.isVisible = true;
        state.error = undefined;
      })
      .addCase(startLoader.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.progress = 0;
        state.cyclePosition = 0;
      })
      .addCase(startLoader.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to start loader';
        state.isAnimating = false;
      })
      .addCase(stopLoader.fulfilled, (state) => {
        state.isAnimating = false;
        state.progress = 100;
      })
      .addCase(setProgress.fulfilled, (state, action) => {
        state.progress = action.payload.progress;
      });
  },
});

// Export actions
export const {
  setLoaderState,
  updateProgress,
  updateCyclePosition,
  setSpeed,
  showLoader,
  hideLoader,
  setLoaderError,
  resetLoader,
} = loaderSlice.actions;

// Selectors
export const selectLoaderState = (state: { loader: LoaderState }) => state.loader;
export const selectLoaderProgress = (state: { loader: LoaderState }) => state.loader.progress;
export const selectLoaderIsVisible = (state: { loader: LoaderState }) => state.loader.isVisible;
export const selectLoaderMessage = (state: { loader: LoaderState }) => state.loader.message;
export const selectLoaderError = (state: { loader: LoaderState }) => state.loader.error;

// Export reducer
export default loaderSlice.reducer;
