import { useLoader } from '../hooks/useLoader';

// Enterprise-standard loader utilities with DRY principles
export class LoaderManager {
  private static instance: LoaderManager;
  private loaderHook = useLoader();

  private constructor() {}

  // Singleton pattern for global loader management
  public static getInstance(): LoaderManager {
    if (!LoaderManager.instance) {
      LoaderManager.instance = new LoaderManager();
    }
    return LoaderManager.instance;
  }

  // Start global loading
  public startLoading(message?: string): void {
    this.loaderHook.start(message);
  }

  // Stop global loading
  public stopLoading(): void {
    this.loaderHook.stop();
  }

  // Update progress
  public updateProgress(progress: number): void {
    this.loaderHook.updateProgress(progress);
  }

  // Simulate async operation
  public async simulateAsync<T>(
    operation: () => Promise<T>,
    message?: string,
    duration: number = 2000
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        this.startLoading(message);
        const startTime = Date.now();
        
        // Update progress every 100ms
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min((elapsed / duration) * 100, 100);
          this.updateProgress(progress);
          
          if (progress >= 100) {
            clearInterval(progressInterval);
          }
        }, 100);

        const result = await operation();
        
        clearInterval(progressInterval);
        this.updateProgress(100);
        setTimeout(() => this.stopLoading(), 500);
        
        resolve(result);
      } catch (error) {
        this.stopLoading();
        reject(error);
      }
    });
  }
}

// Export singleton instance
export const loaderManager = LoaderManager.getInstance();

// Utility functions for common loader operations
export const showLoader = (message?: string) => loaderManager.startLoading(message);
export const hideLoader = () => loaderManager.stopLoading();
export const setLoaderProgress = (progress: number) => loaderManager.updateProgress(progress);
export const withLoaderAsync = <T>(
  operation: () => Promise<T>,
  message?: string,
  duration?: number
) => loaderManager.simulateAsync(operation, message, duration);
