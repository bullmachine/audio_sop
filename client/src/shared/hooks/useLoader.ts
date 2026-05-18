import { useSelector, useDispatch } from 'react-redux';
import { startLoader, stopLoader, setProgress } from '../../redux/loaderSlice';
import type { RootState, AppDispatch } from '../../store/store';

// Enterprise-standard loader hook with DRY principles
export const useLoader = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loaderState = useSelector((state: RootState) => state.loader);

  // Start loading with optional message
  const start = (message?: string) => {
    dispatch(startLoader(message));
  };

  // Stop loading
  const stop = () => {
    dispatch(stopLoader());
  };

  // Set progress (0-100)
  const updateProgress = (progress: number) => {
    dispatch(setProgress(progress));
  };

  // Simulate async operation with progress
  const simulateAsync = async (
    operation: () => Promise<void>,
    message?: string,
    duration: number = 2000
  ) => {
    start(message);
    const startTime = Date.now();
    
    // Update progress every 100ms
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      updateProgress(progress);
      
      if (progress >= 100) {
        clearInterval(progressInterval);
      }
    }, 100);

    try {
      await operation();
    } finally {
      clearInterval(progressInterval);
      updateProgress(100);
      setTimeout(() => stop(), 500); // Brief pause at 100%
    }
  };

  return {
    // State
    isLoading: loaderState.isAnimating,
    progress: loaderState.progress,
    message: loaderState.message,
    cyclePosition: loaderState.cyclePosition,
    isAnimating: loaderState.isAnimating,
    
    // Actions
    start,
    stop,
    updateProgress,
    simulateAsync,
  };
};

export type UseLoaderReturn = ReturnType<typeof useLoader>;
