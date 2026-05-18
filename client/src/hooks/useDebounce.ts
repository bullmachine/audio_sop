import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * @param callback - Function to call after delay
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced function
 */
export const useDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 500
): T => {
  const timeoutRef = useRef<number | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = window.setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback as T;
};

/**
 * Custom hook for debouncing API calls with search
 * @param apiCall - Function that makes the API call
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced API call function
 */
export const useDebouncedApiCall = <T extends (...args: any[]) => Promise<any>>(
  apiCall: T,
  delay: number = 500
): T => {
  return useDebounce(apiCall, delay);
};

/**
 * Custom hook for debounced search with immediate state update and delayed API call
 * @param setSearchText - Function to set search text (immediate)
 * @param fetchData - Function that takes search value and fetches data (debounced)
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Object with debounced functions
 */
export const useDebouncedSearch = (
  setSearchText: (value: string) => void,
  fetchData: (searchValue: string) => Promise<void> | void,
  delay: number = 500
) => {
  // Immediate update for UI
  const updateSearchText = useCallback((value: string) => {
    setSearchText(value);
  }, [setSearchText]);

  // Track the current debounced call to cancel it if needed
  const debouncedCallRef = useRef<number | null>(null);

  // Debounced API call with search value
  const debouncedFetchData = useCallback((searchValue: string) => {
    // Clear any pending debounced call
    if (debouncedCallRef.current) {
      clearTimeout(debouncedCallRef.current);
    }

    // Set new debounced call
    debouncedCallRef.current = window.setTimeout(() => {
      fetchData(searchValue);
      debouncedCallRef.current = null;
    }, delay);
  }, [fetchData, delay]);

  // Cancel pending debounced calls
  const cancelPendingCalls = useCallback(() => {
    if (debouncedCallRef.current) {
      clearTimeout(debouncedCallRef.current);
      debouncedCallRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelPendingCalls();
    };
  }, [cancelPendingCalls]);

  return {
    updateSearchText,
    debouncedFetchData,
    cancelPendingCalls
  };
};
